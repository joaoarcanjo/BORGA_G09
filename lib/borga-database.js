const users = {
    '0f3edb9b-76eb-4fc3-a87b-a40980b9a922': { username: 'diggynovo', name: 'Diogo Novo', club: 'SL Benfica' },
    'fc585a9a-be72-486c-be1a-438f41acbaae': { username: 'jarcs', name: 'João Arcanjo', club: 'FC Alverca' },
    'ad903080-295c-4a84-a7c8-959dda27236d': { username: 'alberta', name: 'Maria Alberta', club: 'Cova da Promise' }
}

const credentials = {
    'diggynovo': { password: 'dslb', token: '0f3edb9b-76eb-4fc3-a87b-a40980b9a922' },
    'jarcs': { password: 'jslb', token: 'fc585a9a-be72-486c-be1a-438f41acbaae' },
    'alberta': { password: 'aslb', token: 'ad903080-295c-4a84-a7c8-959dda27236d' }
}

const games = {
    RLlDWHh7hR : {
        id: "RLlDWHh7hR",
        name: "Gloomhaven",
        description: "<p><strong>Gloomhaven</strong> is a game of Euro-inspired tactical combat in a persistent world " +
            "of shifting motives. Players will take on the role of a wandering adventurer with their own special set of " +
            "skills and their own reasons for traveling to this dark corner of the world.<br /><br />Players must work " +
            "together out of necessity to clear out menacing dungeons and forgotten ruins. In the process they will " +
            "enhance their abilities with experience and loot, discover new locations to explore and plunder, and expand" +
            " an ever-branching story fueled by the decisions they make.<br /><br />This is a legacy game with a " +
            "persistent and changing world that is ideally played over many game sessions. After a scenario, players will" +
            " make decisions on what to do, which will determine how the story continues, kind of like a &quot;Choose" +
            " Your Own Adventure&quot; book. Playing through a scenario is a cooperative affair where players will fight" +
            " against automated monsters using an innovative card system to determine the order of play and what a player" +
            " does on their turn.</p>",
        url: "https://www.boardgameatlas.com/game/RLlDWHh7hR/gloomhaven",
        image_url: "https://s3-us-west-1.amazonaws.com/5cc.images/games/uploaded/1559254920151-51ulRXlJ7LL.jpg",
        mechanics: [
            "Campaign",
            "Cooperative Play",
            "Grid Movement",
            "Hand Management",
            "Legacy",
            "Modular Board",
            "Role Playing",
            "Simultaneous action selection",
            "Storytelling",
            "Variable Player Powers"
        ],
        categories: [
            "Adventure",
            "Fantasy"
        ]
    }
}

const groups = {
    '0f3edb9b-76eb-4fc3-a87b-a40980b9a922': new Map().set(
        0,
        {
            name: 'Horror Games',
            description: 'The scariest horror games in the planet D:',
            games: new Set().add('RLlDWHh7hR')
        }
    )
}

module.exports = {
    credentials,
    users,
    games,
    groups
}