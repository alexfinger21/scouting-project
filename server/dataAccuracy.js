require("dotenv").config()

//const csv = require('fast-csv')
const request = require("request")
const auth = process.env.TBA_AUTH
const gameConstants = require("./game.js")
const { consoleLog, parseData } = require("./utility.js")
const { default: jsPDF } = require("jspdf")
const { json } = require("express")
const { getScoutifyMatchData, database } = require("./database/database.js")
const { getData } = require("./TBAAPIdata.js")

//formerly lebron
async function APIData() //gets the data from theBlueAlliance
{
    const matchData = await getData(); // Make sure to call getData()
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

    //console.log(filteredData); // Check the data for match 1 (or adjust accordingly)
    
    return filteredData;
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
    

    console.log(scouters)
    return filteredData
}

//formerly CaptainLeMerica
async function combinedData()
{
    const [fromTBA,fromDB]=await Promise.all
    ([
        APIData(), DataBaseData()
    ])

    let collectedData = {};
    
    console.log(fromTBA[1].red.autoSpeakerNoteCount)
    //console.log(fromDB)

    const scatterpoints = {autoAmpNoteCount:[], autoSpeakerNoteCount: [], teleopSpeakerNoteCount:[], teleopAmpNoteCount: [],}
    const apiNames = ['211', '210', '301+302', '303']
    for(let n of Object.keys(scatterpoints))
    {

        for (let i = 0; i < Object.keys(fromTBA).length; i++) 
        {   
            scatterpoints[n].push
            ({
                x:fromTBA[i+1].red[n], 
                y:fromDB[i+1].red[apiNames[Object.keys(scatterpoints).indexOf(n)]]
            })
            scatterpoints[n].push
            ({
                x:fromTBA[i+1].blue[n], 
                y:fromDB[i+1].blue[apiNames[Object.keys(scatterpoints).indexOf(n)]]
            })
        }
    }
    console.log(scatterpoints)
}

combinedData();

module.exports = {combinedData}