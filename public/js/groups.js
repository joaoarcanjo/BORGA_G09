{
    document.querySelectorAll('button.delete')
        .forEach(btn => btn.addEventListener('click', deleteGroup))

    document.querySelectorAll('button.update')
        .forEach(btn => btn.addEventListener('click', updateGroup))

    function deleteGroup() {
        const token = document.querySelector('#groups').dataset.token
        const groupId = this.id.replace('delete-groups-', '')
        return fetch(`/api/groups/${groupId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            method: 'delete'
        }).then(({status}) => {
            if (status === 200) {
                // Remove child
                const divGroup = document.querySelector(`#groups-group-${groupId}`)
                divGroup.parentElement.removeChild(divGroup)
            }
        })
    }

    function updateGroup() {
        const name = document.getElementById('update-name').value
        const description = document.getElementById('update-description').value

        const propsToUpdate = {}
        if (name) propsToUpdate.name = name
        if (description) propsToUpdate.description = description
        if (Object.keys(propsToUpdate).length === 0) return

        const token = document.querySelector('#update-group').dataset.token
        const baseUri = document.baseURI.split('/')
        const groupId = baseUri[baseUri.length-2]
        return fetch(`/api/groups/${groupId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(propsToUpdate),
            method: 'put'
        }).then(res => {
            console.log('pixota')
            if (res.status === 200) {

            }
        })
    }
}