const { db } = require('../Firebase/firebase')

const FireStoreDB = {
    getUser: async (req, res) => {
        const { uid } = req.body
        const dataUser = []
        try {
            const userSyncRef = db.collection('user_sync');
            const snapshot = await userSyncRef.where('uid_user', '==', uid).get();  // pasar uid en boddy
            if (snapshot.empty) {
                console.log('No matching documents.');
                res.sendStatus(404)
                //res.status(404).json({ message: 'No matching documents.' });
            }
            snapshot.forEach(doc => {
                dataUser.push(doc.data());
            });
            res.send(dataUser[0]);
        } catch (error) {
            console.log(error)
        }
    },
    saveSteamUserProfile: async (req, res) => {
        const { body } = req;
        const sendData = await db.collection('user_sync').add({
            uid_user: body.uid_user,
            steam_name: body.steam_name,
            steam_id: body.steam_id,
            steam_avatar: body.steam_avatar,
            steam_url: body.steam_url
        });

        console.log('Added document with ID: ', res.id);
    }

}

module.exports = FireStoreDB
