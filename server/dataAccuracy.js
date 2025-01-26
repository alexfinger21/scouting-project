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

async function lebron() //gets the data from theBlueAlliance
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


async function legoat()// Gets the data from the Database
{
    const hello = await getScoutifyMatchData()
    const filteredData = {}
    /*
    210 = Auton notes scored in speaker
    211 = Auton notes scored in amp
    301 = Tele speaker notes not amped
    302 = Tele speaker notes amped
    303 = Tele amp notes
    */
    for (let i = 0; i < hello[1].length; i++) {
        const matchNum = hello[1][i].game_matchup_gm_number + 1;
    
        // Initialize matchNum only if it doesn't exist
        if (!filteredData[matchNum]) {
            filteredData[matchNum] = { red: {}, blue: {} };
        }
    
        const key = hello[1][i].game_element_ge_key;
        const alliance = hello[1][i].game_matchup_gm_alliance;
    
        if (alliance === "B" && [210, 211, 301, 302, 303].includes(key)) {
            filteredData[matchNum].blue[key] = hello[1][i].gd_value;
        } 
        else if (alliance === "R"  && [210, 211, 301, 302, 303].includes(key)) {
            filteredData[matchNum].red[key] = hello[1][i].gd_value;
        }
    }

    //console.log(hello[1])
    //console.log(filteredData)
    //console.log(hello[1][1].game_element_ge_key)
    return filteredData
}

async function CaptainLeMerica()
{
    const fromTBA = await lebron()
    const fromDB = await legoat()

    let collectedData = {};
    
    console.log(fromTBA[1].red.autoSpeakerNoteCount)
    //console.log(fromDB)

    const scatterpoints = []
    
     for (let i = 0; i < Object.keys(fromTBA).length; i++) 
    {
         //console.log(fromTBA[i + 1].red);
         scatterpoints.push({x:fromTBA[i+1].red.autoSpeakerNoteCount, y:fromDB[i+1].red['210']})
        // console.log(scatterpoints)
    }

    console.log(scatterpoints)
    // Object.keys(fromDB).forEach(
    //     (a)=>
    // )
    // Object.keys(fromTBA).forEach(
    //     (a)=>scatterpoints.push({x:a.red.autoSpeakerNoteCount}
    // )


/*
    const combinedData = {}
    for(let i = 0; i < Object.keys(fromTBA).length; i++)
    {
        combinedData[i] = { red: {TBA}, blue: {TBA} }

        combinedData[i].red.TBA.autoSpeakerNoteCount = fromTBA[i+1].red.autoSpeakerNoteCount
    }
    console.log(combinedData)
*/
}

CaptainLeMerica();

module.exports = {lebron}