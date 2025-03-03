/* CHANGE LIST FOR FUTURE */
/*https://docs.google.com/document/d/1w-YcnzkT_l2_xf54Eo3Zhlq_qcHbTWSIyyYcMkvZz-g/edit?usp=sharing*/

/* TODO:
- Make code easier to change once API is updated by adding more constants (I think it's done but should still check in order for the migration to be easier)
- Check the first two function which take the data from TBA and DB and make sure they aren't getting false matches like null and such
*/

require("dotenv").config()

//const csv = require('fast-csv')
const request = require("request")
const auth = process.env.TBA_AUTH
const gameConstants = require("./game.js")
const { consoleLog, parseData } = require("./utility.js")
const { default: jsPDF } = require("jspdf")
const { json } = require("express")
const { getScoutifyMatchData, database } = require("./database/database.js")
const { getData } = require("./TBAAPIData.js")

//make sure you 'git install' so that you have the updated node_modules
const fs = require('node:fs/promises'); // file-system for writing to other files


// CONSTANTS TO BE CHANGED EVERY YEAR

/* TBAAPITNAMES[0] should be the value which correlates to DBNAMES[0] and etc, etc.
   If format isn't followed then the combined data will be wrong*/

/*use 2025 eventually
const TBAAPINAMES = [
"autoLineRobot1", "autoLineRobot2", "autoLineRobot3",
"autoReef.tba_botRowCount", "autoReef.tba_midRowCount", "autoReef.tba_topRowCount", "autoReef.trough",
"teleopReef.tba_botRowCount", "teleopReef.tba_midRowCount", "teleopReef.tba_topRowCount", "teleopReef.trough",
"algaePoints", "endGameRobot1", "endGameRobot2", "endGameRobot3",
]
*/
const TBAAPINAMES = [
    "autoReef.trough", "autoReef.tba_botRowCount", "autoReef.tba_midRowCount", "autoReef.tba_topRowCount",
    "teleopReef.trough", "teleopReef.tba_botRowCount", "teleopReef.tba_midRowCount", "teleopReef.tba_topRowCount",
    ]

//const TBAAPINAMES = ["autoAmpNoteCount", "autoSpeakerNoteCount", "teleopSpeakerNoteCount", "teleopAmpNoteCount"] 
//const DBNAMES = ['211', '210', '301+302', '303']
const DBNAMES = ['Auton L1','Auton L2','Auton L3','Auton L4','Teleop L1', 'Teleop L2', 'Teleop L3', 'Teleop L4']

/* Offsets the the RowDataPacket to go from blue to red.
   Idk how it works, ask mayer*/
const OFFSET = TBAAPINAMES.length

/*
    210 = Auton notes scored in speaker
    211 = Auton notes scored in amp
    301 = Tele speaker notes not amped
    302 = Tele speaker notes amped
    303 = Tele amp notes
*/

// END CONSTANTS

//formerly lebron
async function APIData() //gets the data from theBlueAlliance
{
    const matchData = await getData(); // Make sure to call getData()
    
    const gametype = "qm" //only want qual matches

    const filteredData = {};

    //list of what we get from TBA
    const input = TBAAPINAMES;

    // Loop through all match data
    for (let i = 0; i < matchData.length; i++) {
        const m = matchData[i]
        if (m.comp_level !== gametype) continue; // Filter for valid match types

        const matchNumber = m.match_number
        const scoreBreakdown = m.score_breakdown

        // Initialize filteredData for this match number if it doesn't exist
        filteredData[matchNumber] = { red: {}, blue: {} }

        // Loop through each field in 'input'
        for (let j = 0; j < input.length; j++) {
            const key = input[j];
            
            if (key.includes('.')) { // if key is an object within object (reef.column3)
                const parts = key.split('.'); // split into parts
                
                // Check and assign for red
                if (scoreBreakdown.red[parts[0]] && scoreBreakdown.red[parts[0]][parts[1]] !== undefined) {
                    filteredData[matchNumber].red[parts[0]+parts[1]] = scoreBreakdown.red[parts[0]][parts[1]]; 
                }
                
                // Check and assign for blue
                if (scoreBreakdown.blue[parts[0]] && scoreBreakdown.blue[parts[0]][parts[1]] !== undefined) {
                    filteredData[matchNumber].blue[parts[0]+parts[1]] = scoreBreakdown.blue[parts[0]][parts[1]];
                }
            }
            else {
                // Ensure that the key exists before assigning to filteredData
                if (scoreBreakdown.red[key] !== undefined) {
                    filteredData[matchNumber].red[key] = scoreBreakdown.red[key];
                }
                if (scoreBreakdown.blue[key] !== undefined) {
                    filteredData[matchNumber].blue[key] = scoreBreakdown.blue[key];
                }
            }
        }
    }

   

    let teamData = {}
    for (let i = 1; i < matchData.length; i++) {
        if (matchData[i].comp_level !== gametype) continue; // Filter for valid match types
       
        let alliance = matchData[i].alliances;
        teamData[matchData[i].match_number] = {
            red: alliance.red.team_keys,
            blue: alliance.blue.team_keys
        }
    }


    //console.log(filteredData); // Check the data for match 1 (or adjust accordingly)
    //console.log(teamData)
    return [filteredData, teamData];
}

//formerly legoat
async function DataBaseData()// Gets the data from the Database
{
    const dbData = await getScoutifyMatchData() 

    const offset = OFFSET // offsets the the RowDataPacket to go from blue to red

    const filteredData = {}// the returned obj of filtered match data
    let scouters = {} // the returned obj of scouters

    let num = 0 // an iterator variable. Don't change
    
    //consoleLog(dbData)
    for (let i = 0; i < dbData[1].length; i++) {
        const matchNum = dbData[1][i].game_matchup_gm_number;

        if(matchNum == 0) //skip any 0th match
            continue
    
        if(num < matchNum)
        {   
            const otherMatchNum = Math.ceil(i/(offset*2)) // Bad explanation but here goes: i is the current iterator number, we divide by 2 because there is two teams (blue red), and divide by the offset which is the amount of variables which we store (this is a constant because it varies year to year and it is equal to TBAAPINAMES.length). Even I do not know how exactly the Math.ceil works but it is accounting for some sort of rounding error which occurs for only one type of competition (idk which). Good luck - Artiom

            scouters[otherMatchNum] = {
                red: [], 
                blue: []
            }

            scouters[otherMatchNum].blue = dbData[1][i].user_list
            scouters[otherMatchNum].red = dbData[1][i+offset].user_list

            num = matchNum
        }

        // Initialize matchNum only if it doesn't exist
        if (!filteredData[matchNum]) {
            filteredData[matchNum] = { red: {}, blue: {} };
        }
    
        const key = dbData[1][i].ge_key_group;
        const alliance = dbData[1][i].game_matchup_gm_alliance;
    
        if (alliance === "B" && DBNAMES.includes(key)) {
            filteredData[matchNum].blue[key] = dbData[1][i].gd_value;
        } 
        else if (alliance === "R"  && DBNAMES.includes(key)) {
            filteredData[matchNum].red[key] = dbData[1][i].gd_value;
        }
    }
    //consoleLog(filteredData)
    return [filteredData, scouters]
}

//formerly CaptainLeMerica
async function combinedData() // combine data from TBA and DB
{
    const [fromTBA,fromDB]=await Promise.all
    ([
        APIData(), DataBaseData()
    ])

    const DBMatchData = fromDB[0] // our match data
    const DBScoutersData = fromDB[1] // the people who scouted for the respective matches
    //consoleLog(DBScoutersData)
    const TBAMatchData = fromTBA[0] // tba match data
    const TBAAllianceData = fromTBA[1] // the teams for the respective matches

    let collectedData = {}; // return object, holds all the organized data in the format which can be found at: https://docs.google.com/document/d/1NK2FcjZGP_nJxAf9On0Mf55u8Ig7DmbRmSeLbrkwQI0/edit?tab=t.0
    const scatterpointsNames = TBAAPINAMES;
    let scatterpoints = {}; // will compare the different data from TBA and our DB 
    const apiNames = DBNAMES;

    //console.log(TBAMatchData)
    for (let i = 1; i <= Object.keys(TBAMatchData).length; i++) { // 1-80 inclusive matches, using DBMatchData.length should allow viewing the data while in the midst of a match as it won't try to load nonexistent matches
        scatterpoints[i] = { // each match has red/blue alliance
            red: {},
            blue: {}
        }

        for (let nameNum in scatterpointsNames) { // a set of scatterpoints for each type of API key
            let name = scatterpointsNames[nameNum]

            let dbPoitnRed = 0
            let dbPointBlue = 0
            if (typeof DBMatchData[i] !== 'undefined') {
                dbPoitnRed = DBMatchData[i].red[apiNames[nameNum]]
                dbPointBlue = DBMatchData[i].blue[apiNames[nameNum]]
            }
            scatterpoints[i].red[name] = { // example of this object filled in would be: autoAmpNoteCount:{TBA: TBAMatchData[i].red.autoAmpNoteCount, DB: DBMatchData[i].red['211']}, 
                TBA: TBAMatchData[i].red[name] || 0, // The x value of the scatterpoint
                DB: dbPoitnRed // The y value of the scatter point
            }

            scatterpoints[i].blue[name] = { // same as the above but for blue alliance
                TBA: TBAMatchData[i].blue[name] || 0, 
                DB: dbPointBlue
            }
        }
    }

    // scatterpoints has been initialized now we must collect all the data in collectedData

    for (let i = 1; i <= Object.keys(TBAMatchData).length; i++) { // run through all 80 matches
        collectedData[i] = {
            red: {
                teams: TBAAllianceData[i].red, // Note that the index of teams and scouters match up, so scouters[0] was scouting teams[0] and etc.
                scouters: DBScoutersData[i].red.split(', '), // we split because currently it is a string like 'aaron, alex, artiom'
                matchStats: {} // to be populated later on
            },
            blue: {
                teams: TBAAllianceData[i].blue,
                scouters: DBScoutersData[i].blue.split(', '),
                matchStats: {}
            }
        }

        for (let nameNum in scatterpointsNames) { // populate matchStats
            let name = scatterpointsNames[nameNum]

            collectedData[i].red.matchStats[name] = scatterpoints[i].red[name]
            collectedData[i].blue.matchStats[name] = scatterpoints[i].blue[name]
        }
    }

    // try { // Write the collectedData to temp.json in root to view
    //     let json = JSON.stringify(collectedData, null, 2); // convert js object (collectedData) to json with an indentation of 2
    //     await fs.writeFile('./temp.json', json); // write the new json to temp.json

    //     console.log("Successfully wrote collectedData to ./temp.json")
    // }
    // catch (err) {
    //     console.error(err)
    // }
    const rtrData = [TBAAPINAMES, collectedData]
    return JSON.stringify(rtrData, null, 2)
}

//combinedData();
//APIData()
DataBaseData()

module.exports = {combinedData, TBAAPINAMES}
