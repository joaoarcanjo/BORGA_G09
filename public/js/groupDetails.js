{
    document.querySelectorAll('button.delete')
        .forEach(btn => btn.addEventListener('click', deleteGame))
        
    function deleteGame() {
        const token = document.querySelector('#games').dataset.token
        const info = this.id.replace('delete-games-', '').split('-')
        const groupId = info[0]
        const gameId = info[1]
        return fetch(`/api/groups/${groupId}/${gameId}`, { 
            headers: {
                Authorization: `Bearer ${token}`
            },
            method: 'delete'
        }).then(({status}) => {
            if (status === 200) {
                const divGame = document.querySelector(`#game-${gameId}`)
                divGame.parentElement.removeChild(divGame)
                rearrangeGames()
            }
        })
    }

    function rearrangeGames() {
        const gamesElem = document.querySelectorAll(`div.game`)
        gamesElem.forEach(ga => ga.parentElement.removeChild(ga))
        const gamesRows = document.querySelectorAll('div.game-row')
        gamesRows.forEach((jr, idx) => { 
            rearrangeGamesAux(gamesElem, jr, idx)
        })
    
    }

    function rearrangeGamesAux(gamesElem, jr, idx) {
        for (let i = 0; i < 6; i++) {
            jr.appendChild(gamesElem[idx*6+i]); 
        }
    }
}