const auth = process.env.TBA_AUTH

export const readTBA = async (url) => {
    const response = await fetch("https://www.thebluealliance.com/api/v3" + url, {
        headers: { "X-TBA-Auth-Key": auth },
    });

    if (response.status === 200) {
        return response.json();
    }

    throw new Error("TBA Error: " + response.status);
};

const getAlliances = async (eventId) => {
    const rawAlliances = await readTBA(/event/${ eventId } / alliances);
    const alliances = rawAlliances?.map((alliance, i) => {
        console.log(alliance)
        return {
            rank: i + 1,
            teams: alliance?.picks?.map((pick) => parseInt(pick?.slice(3))),
            //record: ${ alliance?.status?.record?.wins } - ${ alliance?.status?.record?.losses } - ${ alliance?.status?.record?.ties },
            //status: alliance?.status?.status,
        }
    });

    return alliances;
};

