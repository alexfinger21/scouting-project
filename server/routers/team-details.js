import database from "../database/database.js"
import express from "express"
import gameConstants from "../game.js"
const router = express.Router()
import { getMatchVideos } from "../TBAAPIData.js"
import SQL from "sql-template-strings"

const TEAM_API_BASE_URL = process.env.TEAM_API_BASE_URL || "https://api.team695.com"

// Not recommended to have these credentials in the frontend, this is a temporary test, 
// do not use these values in any public client-side code or share them, 
// production mode should using user's own jwt token for authentication
const TEAM_API_ACCESS_KEY = process.env.TEAM_API_ACCESS_KEY
const TEAM_API_ACCESS_SECRET = process.env.TEAM_API_ACCESS_SECRET

// These groups and matchers are used to heuristically organize pit scouting fields into sections for display in the UI.
const PIT_FIELD_GROUPS = [
    {
        key: "overview",
        title: "Overview",
        matchers: [/team number/i, /drive team/i, /driver/i, /practice/i, /hours/i, /role preference/i, /preferred/i, /log url/i],
    },
    {
        key: "robot",
        title: "Robot Build",
        matchers: [/drive train/i, /wheel/i, /weight/i, /dimension/i, /length/i, /width/i, /height/i, /bumper/i],
    },
    {
        key: "mobility",
        title: "Mobility",
        matchers: [/mobility/i, /\bbump\b/i, /movement/i, /swerve/i, /tank/i],
    },
    {
        key: "autonomous",
        title: "Autonomous",
        matchers: [/autonomous/i, /\bauto\b/i, /starting zone/i, /vision/i],
    },
    {
        key: "acquisition",
        title: "Acquisition",
        matchers: [/intake/i, /acquisition/i, /pickup/i, /station/i, /outpost/i, /depot/i],
    },
    {
        key: "scoring",
        title: "Scoring",
        matchers: [/scoring/i, /score/i, /goal/i, /range/i, /location/i, /fuel/i, /coral/i, /algae/i],
    },
    {
        key: "endgame",
        title: "Endgame",
        matchers: [/climb/i, /endgame/i, /tower/i, /cage/i],
    },
    {
        key: "notes",
        title: "Notes",
        matchers: [/comment/i, /notes?/i, /strategy/i],
    },
]

// Processing and normalization functions for handling Team API data
function parseMaybeJson(value) {
    if (typeof value !== "string") {
        return value
    }

    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}

function isPlainObject(value) {
    return value != null && typeof value === "object" && !Array.isArray(value)
}

function firstDefined(...values) {
    return values.find((value) => value !== undefined && value !== null)
}

function normalizeTeamNumber(value) {
    if (value == null) {
        return null
    }

    const normalized = String(value).trim().toLowerCase().replace(/^frc/, "")
    return normalized.length > 0 ? normalized : null
}

function dedupeItems(items) {
    const seen = new Set()

    return items.filter((item) => {
        const key =
            typeof item === "object" && item !== null
                ? JSON.stringify(item)
                : String(item)

        if (seen.has(key)) {
            return false
        }

        seen.add(key)
        return true
    })
}

function mergeUploadData(target, source) {
    if (!isPlainObject(source)) {
        return target
    }

    for (const [key, value] of Object.entries(source)) {
        if (Array.isArray(value)) {
            const current = Array.isArray(target[key]) ? target[key] : []
            target[key] = dedupeItems([...current, ...value])
            continue
        }

        if (isPlainObject(value) && isPlainObject(target[key])) {
            target[key] = {
                ...target[key],
                ...value,
            }
            continue
        }

        target[key] = value
    }

    return target
}

function cleanPitLabel(label) {
    return String(label).replace(/\s*:+\s*$/g, "").trim()
}

function isEmptyPitValue(value) {
    if (value == null) {
        return true
    }

    if (Array.isArray(value)) {
        return value.length === 0 || value.every(isEmptyPitValue)
    }

    if (typeof value === "string") {
        return value.trim().length === 0
    }

    if (isPlainObject(value)) {
        return Object.keys(value).length === 0
    }

    return false
}

function formatPitValue(value) {
    if (Array.isArray(value)) {
        return value.filter((item) => !isEmptyPitValue(item)).map(formatPitValue)
    }

    if (value == null) {
        return null
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No"
    }

    if (typeof value === "number") {
        return Number.isInteger(value) ? String(value) : String(value)
    }

    if (isPlainObject(value)) {
        return Object.entries(value)
            .map(([key, nestedValue]) => `${cleanPitLabel(key)}: ${formatPitValue(nestedValue)}`)
            .join(" | ")
    }

    return String(value)
}

function getPitGroup(label) {
    const normalizedLabel = cleanPitLabel(label)

    return (
        PIT_FIELD_GROUPS.find(({ matchers }) =>
            matchers.some((matcher) => matcher.test(normalizedLabel)),
        ) ?? {
            key: "other",
            title: "Other",
        }
    )
}

function buildPitSections(data) {
    if (!isPlainObject(data)) {
        return []
    }

    const groups = new Map()

    for (const [rawLabel, rawValue] of Object.entries(data)) {
        if (isEmptyPitValue(rawValue)) {
            continue
        }

        const label = cleanPitLabel(rawLabel)
        const formattedValue = formatPitValue(rawValue)

        if (isEmptyPitValue(formattedValue)) {
            continue
        }

        const group = getPitGroup(label)

        if (!groups.has(group.key)) {
            groups.set(group.key, {
                title: group.title,
                items: [],
            })
        }

        groups.get(group.key).items.push({
            label,
            value: formattedValue,
            isList: Array.isArray(formattedValue),
            isLink:
                !Array.isArray(formattedValue) &&
                typeof formattedValue === "string" &&
                /^https?:\/\//i.test(formattedValue),
        })
    }

    return PIT_FIELD_GROUPS.map(({ key, title }) => groups.get(key) ?? null)
        .concat(groups.has("other") ? [groups.get("other")] : [])
        .filter((group) => group && group.items.length > 0)
        .map((group) => ({
            title: group.title,
            items: group.items.sort((a, b) => a.label.localeCompare(b.label)),
        }))
}

function extractPitImages(uploadData) {
    if (!isPlainObject(uploadData)) {
        return []
    }

    const images = []

    for (const [bucketName, value] of Object.entries(uploadData)) {
        if (!Array.isArray(value)) {
            continue
        }

        for (const item of value) {
            if (!item?.url) {
                continue
            }

            images.push({
                url: item.url,
                name: item.name || cleanPitLabel(bucketName),
                category: cleanPitLabel(bucketName).replace(/Images$/i, " Images"),
            })
        }
    }

    return dedupeItems(images)
}

// Make sure you're using user's own JWT token for authentication when making requests,
// Never ever use your personal access key or secret in any client-side code
function getRequestBearerToken(req) {
    const cookieToken = req.cookies?.u_token
    const authHeader = req.get("Authorization")

    if (cookieToken?.length > 0) {
        return cookieToken
    }

    if (!authHeader) {
        return null
    }

    return authHeader.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length)
        : authHeader
}

function buildTeamApiHeaders(req, includeAuth = true) {
    const headers = {
        Accept: "application/json",
    }

    if (TEAM_API_ACCESS_KEY) {
        headers["X-API-Key"] = TEAM_API_ACCESS_KEY
    }

    if (TEAM_API_ACCESS_SECRET) {
        headers["X-API-Secret"] = TEAM_API_ACCESS_SECRET
    }

    if (includeAuth) {
        const token = getRequestBearerToken(req)

        if (token) {
            headers.Authorization = `Bearer ${token}`
        }
    }

    return headers
}

async function fetchTeamApi(pathname, { req, query = {}, includeAuth = true } = {}) {
    const url = new URL(pathname, TEAM_API_BASE_URL)

    for (const [key, value] of Object.entries(query)) {
        if (value != null && String(value).trim().length > 0) {
            url.searchParams.set(key, String(value).trim())
        }
    }

    const response = await fetch(url, {
        method: "GET",
        headers: buildTeamApiHeaders(req, includeAuth),
    })

    const rawText = await response.text()
    const payload = rawText.length > 0 ? parseMaybeJson(rawText) : {}

    if (!response.ok || payload?.success === false) {
        const message =
            payload?.message ||
            payload?.error ||
            `Team API request failed with status ${response.status}`
        const error = new Error(message)
        error.status = response.status || payload?.status || 500
        throw error
    }

    return payload
}

function extractEventIdFromPayload(payload) {
    return firstDefined(
        payload?.eventId,
        payload?.event_id,
        payload?.data?.eventId,
        payload?.data?.event_id,
    )
}

function extractSurveyResponses(payload) {
    if (Array.isArray(payload)) {
        return payload
    }

    const candidates = [
        payload?.data,
        payload?.responses,
        payload?.results,
        payload?.items,
        payload?.rows,
        payload?.data?.responses,
        payload?.data?.results,
        payload?.data?.items,
        payload?.data?.rows,
    ]

    for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
            return candidate
        }
    }

    if (
        isPlainObject(payload?.data) &&
        (
            payload.data.id !== undefined ||
            payload.data.form_id !== undefined ||
            payload.data.formId !== undefined ||
            payload.data.event_id !== undefined
        )
    ) {
        return [payload.data]
    }

    if (
        isPlainObject(payload) &&
        (
            payload.id !== undefined ||
            payload.form_id !== undefined ||
            payload.formId !== undefined ||
            payload.event_id !== undefined
        )
    ) {
        return [payload]
    }

    return []
}

function responseMatchesTeamNumber(response, teamNumber) {
    const expectedTeamNumber = normalizeTeamNumber(teamNumber)
    if (!expectedTeamNumber || !isPlainObject(response)) {
        return false
    }

    const responseTeamNumber = firstDefined(
        response.team_number,
        response.teamNumber,
        response.data?.team_number,
        response.data?.teamNumber,
        response.data?.["Team number"],
        response.data?.["Team Number"],
        response.data?.["team number"],
        response.data?.["team_number"],
    )

    return normalizeTeamNumber(responseTeamNumber) === expectedTeamNumber
}

function deriveFallbackEventId(teamResults) {
    const firstTeam = Array.isArray(teamResults) ? teamResults[0] : null
    const seasonYear = firstTeam?.frc_season_master_sm_year ?? gameConstants.YEAR
    const eventCode =
        firstTeam?.competition_master_cm_event_code ?? gameConstants.COMP

    if (!seasonYear || !eventCode) {
        return null
    }

    return `${seasonYear}_${String(eventCode).toUpperCase()}`
}

// Attempt to get the current event ID from the Team API
async function getCurrentTeamApiEventId(req, teamResults) {
    if (req.query.eventId) {
        return String(req.query.eventId).trim()
    }

    try {
        const response = await fetchTeamApi("/event/event-id", {
            req,
            includeAuth: false,
        })

        const eventId = extractEventIdFromPayload(response)
        if (typeof eventId === "string" && eventId.trim().length > 0) {
            return eventId.trim()
        }
    } catch {
        // Fall back to local event context when the Team API endpoint is unavailable.
    }

    return deriveFallbackEventId(teamResults)
}

function mergeSurveyResponses(responses) {
    const normalizedResponses = responses
        .map((response) => ({
            ...response,
            data: parseMaybeJson(firstDefined(response.data, response.formData, response.surveyData)),
            upload: parseMaybeJson(firstDefined(response.upload, response.images, response.uploadData)),
            user_data: parseMaybeJson(firstDefined(response.user_data, response.userData)),
            form_id: firstDefined(response.form_id, response.formId),
            timestamp: firstDefined(response.timestamp, response.createdAt, response.created_at),
        }))
        .sort(
            (a, b) =>
                new Date(a.timestamp ?? 0).getTime() -
                new Date(b.timestamp ?? 0).getTime(),
        )

    if (normalizedResponses.length === 0) {
        return null
    }

    const latestResponse = normalizedResponses.at(-1)
    const mergedData = {}
    let mergedUpload = {}
    let latestUserData = {}
    const formIds = new Set()

    for (const response of normalizedResponses) {
        if (isPlainObject(response.data)) {
            Object.assign(mergedData, response.data)
        }

        mergedUpload = mergeUploadData(mergedUpload, response.upload)

        if (isPlainObject(response.user_data)) {
            latestUserData = {
                ...latestUserData,
                ...response.user_data,
            }
        }

        if (response.form_id) {
            formIds.add(response.form_id)
        }
    }

    return {
        rawResponses: normalizedResponses,
        latestResponse,
        data: mergedData,
        upload: mergedUpload,
        userData: latestUserData,
        formIds: Array.from(formIds),
    }
}

async function getPitScoutingData(req, teamNumber, teamResults) {
    const eventId = await getCurrentTeamApiEventId(req, teamResults)
    const pitData = {
        eventId,
        status: "empty",
        message: "",
        sections: [],
        images: [],
        responseCount: 0,
        lastUpdated: null,
        submitter: null,
    }

    if (!eventId) {
        pitData.message = "Unable to determine the current event ID for pit scouting."
        return pitData
    }

    try {
        const response = await fetchTeamApi("/survey/query", {
            req,
            query: {
                eventId,
                teamNumber,
            },
        })

        let responses = extractSurveyResponses(response)

        if (responses.length === 0) {
            const fallbackResponse = await fetchTeamApi("/survey/query", {
                req,
                query: {
                    eventId,
                },
            })

            responses = extractSurveyResponses(fallbackResponse).filter((item) =>
                responseMatchesTeamNumber(
                    {
                        ...item,
                        data: parseMaybeJson(
                            firstDefined(item.data, item.formData, item.surveyData),
                        ),
                    },
                    teamNumber,
                ),
            )
        }

        pitData.responseCount = responses.length

        if (responses.length === 0) {
            pitData.message = "No pit scouting responses found for this team at the current event."
            return pitData
        }

        const mergedSurvey = mergeSurveyResponses(responses)

        pitData.status = "ready"
        pitData.sections = buildPitSections(mergedSurvey?.data)
        pitData.images = extractPitImages(mergedSurvey?.upload)
        pitData.lastUpdated = mergedSurvey?.latestResponse?.timestamp ?? null
        pitData.submitter =
            mergedSurvey?.userData?.displayName ||
            mergedSurvey?.userData?.username ||
            mergedSurvey?.userData?.email ||
            null

        if (pitData.sections.length === 0) {
            pitData.message = "Pit scouting responses were found, but there were no displayable fields in the payload."
        }

        return pitData
    } catch (error) {
        const message = error.message || "Unable to load pit scouting data from Team API."
        const looksLikeAuthError =
            error.status === 401 ||
            error.status === 403 ||
            /admin|auth|unauthor/i.test(message)

        pitData.status = "error"
        pitData.message =
            looksLikeAuthError
                ? "Pit scouting data requires a Casdoor admin account in Team API."
                : message
        return pitData
    }
}


// --------------------------------------
// Old Scouting APP Database stuff
// -------------------------------------- 
router.get("/", async function (req, res) {
    //only gets used if the url == team-details
    let [err1, team_results] = await database.query(
        database.getTeamDetailsTeamData(),
    )

    team_results = JSON.parse(JSON.stringify(team_results))
    let teamNumber = req.query.team || 695
    const selectedPage = req.query.selectedPage || "game-data-page"

    let matchVideos

    try {
        matchVideos = await getMatchVideos()
    } catch {
        matchVideos = []
    }

    let teamInfo = team_results.find(
        (element) => element.team_master_tm_number == teamNumber,
    )
    if (teamInfo == null || teamInfo == undefined) {
        teamInfo = team_results[0]
        teamNumber = team_results[0].team_master_tm_number
    }

    let [err2, results] = await database.query(SQL`SELECT DISTINCT gd.gd_um_id, vmd.*
        FROM teamsixn_scouting_dev.game_details gd
        INNER JOIN (
            SELECT
            *
            FROM 
            teamsixn_scouting_dev.v_match_detail vmd
            WHERE
            vmd.frc_season_master_sm_year = ${gameConstants.YEAR} AND
            vmd.competition_master_cm_event_code = ${gameConstants.COMP} AND 
            vmd.game_matchup_gm_game_type = ${gameConstants.GAME_TYPE} AND
            vmd.team_master_tm_number = ${teamNumber}
        ) AS vmd ON vmd.frc_season_master_sm_year = gd.frc_season_master_sm_year AND
        vmd.competition_master_cm_event_code = gd.competition_master_cm_event_code
        AND
        vmd.game_matchup_gm_game_type = gd.game_matchup_gm_game_type AND
        vmd.game_matchup_gm_number = gd.game_matchup_gm_number AND
        vmd.game_matchup_gm_alliance = gd.game_matchup_gm_alliance AND
        vmd.game_matchup_gm_alliance_position = gd.game_matchup_gm_alliance_position; `)
    results = JSON.parse(JSON.stringify(results))

    let [err4, comments] = await database.query(
        database.getMatchComments(teamNumber),
    )
    comments = JSON.parse(JSON.stringify(comments))

    const teamData = results
        .slice()
        .sort((a, b) => a.game_matchup_gm_number - b.game_matchup_gm_number)
    const pitScoutingData = await getPitScoutingData(req, teamNumber, team_results)

    res.render("team-details", {
        teams: team_results
        .map((e) => e.team_master_tm_number)
        .sort((a, b) => a - b),
        teamData: teamData,
        teamInfo: teamInfo,
        matchVideos: matchVideos,
        selectedTeam: teamNumber,
        comments: comments,
        selectedPage: selectedPage,
        match: teamData[0]?.game_matchup_gm_number ?? null,
        pitScoutingData,
    })
})

router.post("/", function (req, res) {
    return res.send("req received")
})

export default router
