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

async function lebron() 
{
    const matchData = await getData(); // Make sure to call getData()
    const gametype = (gameConstants.GAME_TYPE.toLowerCase() === "qm" || gameConstants.GAME_TYPE.toLowerCase() === "q") ? "qm" : "";

    const filteredData = {};

    let input = `
autoAmpNoteCount
autoSpeakerNoteCount
teleopSpeakerNoteCount
teleopAmpNoteCount`;

    input = input.trim().split("\n"); // Everything in an array
    // Loop through all match data
    for (let i = 0; i < matchData.length; i++) {
        const m = matchData[i];
        if (m.comp_level !== gametype) continue; // Filter for valid match types

        const matchNumber = m.match_number;
        const scoreBreakdown = m.score_breakdown;

        // Initialize filteredData for this match number if it doesn't exist
        filteredData[matchNumber] = { red: {}, blue: {} };

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

    console.log(filteredData); // Check the data for match 1 (or adjust accordingly)
    
    return filteredData;
}



/*
    Artiom READ THIS
    as of right now legoat pulls data from getScoutifyMatchData() succesfully
    what I need to do is to create a for loop that will end up with legoat returning an object 
    that is x long with x being the number of matches for the given comp that we are lesting for

    to do this you will need to sort through the elements of hello which look like this

    RowDataPacket {
  frc_season_master_sm_year: 2024,
  competition_master_cm_event_code: 'ohcl',
  game_matchup_gm_game_type: 'Q',
  game_matchup_gm_number: 0,
  game_matchup_gm_alliance: 'B',
  game_element_ge_key: 210,
  gd_value: 3,
  gd_score: 15

  you will need to have the match number = game_matchup_gm_number:
 
  you should filter to make sure we only qualificaition matches with game_matchup_gm_game_type: 'Q',
 
  you need to be able to sort between red and blue alliance using game_matchup_gm_alliance:
 
  a key for what the value of  game_element_ge_key: is provided bellow and you should add the elements of
  301 and 302 together

  gd_value is the number of notes scored 
  gd_score is the number of points made from those notes
  we should use both

  also dont forget to push your code
  and also dont forget you can ask me questions if you need
*/
async function legoat() 
{
    const hello = await getScoutifyMatchData()
    let filteredData = {}
    /*
    210 = Auton notes scored in speaker
    211 = Auton notes scored in amp
    301 = Tele speaker notes not amped
    303 = Tele speaker notes amped
    304 = Tele amp notes
    */

    console.log(hello[1][20])
}

legoat();

module.exports = {lebron}