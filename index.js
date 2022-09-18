const express = require('express');
const port = process.env.PORT || 3000
const app = express();
const path = require("path");


const mercadopago = require('./Controller/MercadoPago.js')
const FireStoreDB = require('./Controller/FireStore.js')

const passport = require('passport');
const session = require('express-session');
const passportSteam = require('passport-steam');
const SteamStrategy = passportSteam.Strategy;

const cors = require('cors');;


app.use(express.urlencoded({ extended: false }), cors(), express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));


// SteamStrategy Login 
passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

//inicializando Strategy
passport.use(new SteamStrategy({
    returnURL: `${process.env.BACK_END_URL}/api/auth/steam/return`,
    realm: `${process.env.BACK_END_URL}`,
    apiKey: `${process.env.API_KEY_STEAM}`,
}, function (identifier, profile, done) {
    process.nextTick(() => {
        profile.identifier = identifier;
        return done(null, profile)
    })
})
)

app.use(session({
    secret: `${process.env.PALABRA_SECRET_PASSPORT}`,
    saveUninitialized: true,
    resave: false,
    cookie: {
        maxAge: 3600000
    }
}))
app.use(passport.initialize());
app.use(passport.session());


// Endpoint Steam Login
app.get('/', (req, res) => {
    //console.log(req)
    res.send('ok');
});



app.get('/api/auth/steam', passport.authenticate('steam', { failureRedirect: '/' }), function (req, res) {
    constole.log(req)
    res.redirect('/')
});

app.get('/api/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/' }), async function (req, res) {
    //await console.log('req', req)
    //console.log('req', req)

    // jwtToken: req.user._json.steamid,
    //     clientUrl: 'http://127.0.0.1:5173/profile',
    res.render("authenticated", {
        steam_id: req.user._json.steamid,
        steam_name: req.user._json.personaname,
        url_steam: req.user._json.profileurl,
        img_steam: req.user._json.avatarmedium,
        clientUrl: `${process.env.FRONT_END_APP}/profile`,
    });
});


// Endpoint MercadoPago
app.post('/create_payment', mercadopago.post) // create payment
app.get('/feedback', mercadopago.get); // feedback
app.post("/ipn", mercadopago.ipn)

// Firestore Endpoint
app.post('/getuser', FireStoreDB.getUser)

app.post('/save_user_steam', FireStoreDB.saveSteamUserProfile)



app.listen(port, () => {
    console.log(`listening on port ${port}`);
})