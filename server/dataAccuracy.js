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

const fs = require('node:fs/promises');

//formerly lebron
async function APIData() //gets the data from theBlueAlliance
{
    const matchData = await getData(); // Make sure to call getData()
    //console.log(matchData[0].alliances.blue.team_keys); // [ 'frc3015', 'frc2172', 'frc1787' ]
    const gametype = (gameConstants.GAME_TYPE.toLowerCase() === "qm" || gameConstants.GAME_TYPE.toLowerCase() === "q") ? "qm" : "";

    const filteredData = {};

    //list of what we get from TBA
    let input = `
autoAmpNoteCount
autoSpeakerNoteCount
teleopSpeakerNoteCount
teleopAmpNoteCount`;

    input = input.trim().split("\n"); // Everything in an array
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
            // Ensure that the key exists before assigning to filteredData
            if (scoreBreakdown.red[key] !== undefined) {
                filteredData[matchNumber].red[key] = scoreBreakdown.red[key];
            }
            if (scoreBreakdown.blue[key] !== undefined) {
                filteredData[matchNumber].blue[key] = scoreBreakdown.blue[key];
            }
        }
    }

    let teamData = {}
    for (let i = 1; i < matchData.length; i++) {
        let alliance = matchData[0].alliances;
        teamData[i] = {
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
    /*
    210 = Auton notes scored in speaker
    211 = Auton notes scored in amp
    301 = Tele speaker notes not amped
    302 = Tele speaker notes amped
    303 = Tele amp notes
    */


    //change year by year
    const offset = 4 // offsets the the RowDataPacket to go from blue to red

    const filteredData = {}//dont change
    let scouters = {}//dont change
    let teams = {}//dont change
    let num = 0 //dont change


    for (let i = 0; i < dbData[1].length; i++) {
        const matchNum = dbData[1][i].game_matchup_gm_number;

        if(matchNum == 0) //skip any 0th match
            continue
    
        if(num < matchNum)
        {   
            const otherMatchNum = i/(offset*2)

            scouters[otherMatchNum] = {red: [], blue: []}
            scouters[otherMatchNum].blue = dbData[1][i].user_list
            scouters[otherMatchNum].red = dbData[1][i+offset].user_list
            teams[otherMatchNum] = {red: [], blue: []}
            teams[otherMatchNum].blue = dbData[1][i].team_list
            teams[otherMatchNum].red = dbData[1][i+offset].team_list

            num = matchNum
        }


        
        // Initialize matchNum only if it doesn't exist
        if (!filteredData[matchNum]) {
            filteredData[matchNum] = { red: {}, blue: {} };
        }
    
        const key = dbData[1][i].ge_key_group;
        const alliance = dbData[1][i].game_matchup_gm_alliance;

        //console.log(key)
    
        if (alliance === "B" && ['210', '211', '301+302', '303'].includes(key)) {
            filteredData[matchNum].blue[key] = dbData[1][i].gd_value;
        } 
        else if (alliance === "R"  && ['210', '211', '301+302', '303'].includes(key)) {
            filteredData[matchNum].red[key] = dbData[1][i].gd_value;
        }
    }
    

    //console.log(scouters)
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

    const TBAMatchData = fromTBA[0] // tba match data
    const TBAAllianceData = fromTBA[1] // the teams for the respective matches

    let collectedData = {}; // return object, holds all the organized data in the format which can be found at: https://docs.google.com/document/d/1NK2FcjZGP_nJxAf9On0Mf55u8Ig7DmbRmSeLbrkwQI0/edit?tab=t.0
    //const scatterpointsNames = {autoAmpNoteCount:[], autoSpeakerNoteCount: [], teleopSpeakerNoteCount:[], teleopAmpNoteCount: [],} // Will compare the different data from TBA and our DB 
    let scatterpoints = {};
    const apiNames = ['211', '210', '301+302', '303'] 

    for (let i = 1; i <= 80; i++) {
        scatterpoints[i] = {
            red: {
                autoAmpNoteCount:{TBA: TBAMatchData[i].red.autoAmpNoteCount, DB: DBMatchData[i].red['211']}, 
                autoSpeakerNoteCount: {TBA: TBAMatchData[i].red.autoSpeakerNoteCount, DB: DBMatchData[i].red['210']}, 
                teleopSpeakerNoteCount:{TBA: TBAMatchData[i].red.teleopSpeakerNoteCount, DB: DBMatchData[i].red['301+302']}, 
                teleopAmpNoteCount: {TBA: TBAMatchData[i].red.teleopAmpNoteCount, DB: DBMatchData[i].red['303']}
            },
            blue: {
                autoAmpNoteCount:{TBA: TBAMatchData[i].blue.autoAmpNoteCount, DB: DBMatchData[i].blue['211']}, 
                autoSpeakerNoteCount: {TBA: TBAMatchData[i].blue.autoSpeakerNoteCount, DB: DBMatchData[i].blue['210']}, 
                teleopSpeakerNoteCount:{TBA: TBAMatchData[i].blue.teleopSpeakerNoteCount, DB: DBMatchData[i].blue['301+302']}, 
                teleopAmpNoteCount: {TBA: TBAMatchData[i].blue.teleopAmpNoteCount, DB: DBMatchData[i].blue['303']}
            }
        }
    }
   //console.log(scatterpoints)

    // scatterpoints has been initialized now we must collect all the data in collectedData
    for (let i = 1; i <= 80; i++) { // run through all 80 matches
        collectedData[i] = {
            red: {
                teams: TBAAllianceData[i].red, // Note that the index of teams and scouters match up, so scouters[0] was scouting teams[0] and etc.
                scouters: DBScoutersData[i].red.split(', '),
                matchStats: {
                    autoAmpNoteCount: scatterpoints[i].red.autoAmpNoteCount,
                    autoSpeakerNoteCount: scatterpoints[i].red.autoSpeakerNoteCount,
                    teleopSpeakerNoteCount: scatterpoints[i].red.teleopSpeakerNoteCount,
                    teleopAmpNoteCount: scatterpoints[i].red.teleopAmpNoteCount
                }
            },
            blue: {
                teams: TBAAllianceData[i].blue,
                scouters: DBScoutersData[i].blue.split(', '),
                matchStats: {
                    autoAmpNoteCount: scatterpoints[i].blue.autoAmpNoteCount,
                    autoSpeakerNoteCount: scatterpoints[i].blue.autoSpeakerNoteCount,
                    teleopSpeakerNoteCount: scatterpoints[i].blue.teleopSpeakerNoteCount,
                    teleopAmpNoteCount: scatterpoints[i].blue.teleopAmpNoteCount
                }
            }
        }
    }

    try { // Write the collectedData to temp.json in root to view
        let json = JSON.stringify(collectedData, null, 2);
        await fs.writeFile('./temp.json', json);

        console.log("Successfully wrote collectedData to ./temp.json")
    }
    catch (err) {
        console.error(err)
    }
}

combinedData();
//APIData()
//DataBaseData()

module.exports = {combinedData}