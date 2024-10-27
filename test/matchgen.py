import csv
# to get data use
# https://www.imagetotext.info/

matches=21
year="2024"
datestring="2024-09-23"
comp="temp"
gametype="Q"

inputpath="/home/dotandana/Documents/Code/scouting-project/test/input.txt"

with open(inputpath) as input:
    lines = input.readlines()        
    with open('output.csv', "w", newline="") as f:
        writer = csv.writer(f, delimiter=",", \
            quotechar='ñ', quoting=csv.QUOTE_MINIMAL)
        writer.writerow([
            "frc_season_master_sm_year",
            "competition_master_cm_event_code",
            "gm_game_type",
            "gm_number",
            "gm_alliance",
            "gm_alliance_position",
            "team_master_tm_number",
            "gm_value",
            "gm_timestamp",
            "cm_event_code"
        ])
        for i in range(matches):
            l = i*8
            date = lines[l]
            #print(l)
            #print(date, date.split())
            #print("D:", date.split(" ")[1].replace("-",":") + ":00")
            timestamp = f'"{datestring} ' + date.split(" ")[1].replace("-",":") + ':00"'
            teams = [lines[l + x].strip() for x in range(2, 8)]
            for k in range(0, 6):
                pos = (k % 3) + 1
                writer.writerow([year, comp, gametype, i+1, "B" if k < 3 else "R", pos, teams[k], "0", timestamp, comp])
