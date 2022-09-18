const mercadopago = require('mercadopago');
const { db } = require('../Firebase/firebase')
const axios = require('axios').default;

mercadopago.configure({
    access_token: `${process.env.API_KEY_MERCADOPAGO}`,
})

const MercadoPago = {
    post: async (req, res) => {
        const { body } = req
        console.log(body)
        let preference = {
            items: [
                {
                    currency_id: 'CLP',
                    title: body.title,
                    unit_price: Number(body.price),
                    quantity: 1,
                    id: body.id
                }
            ],
            auto_return: "approved",
            back_urls: {
                "success": `${process.env.FRONT_END_APP}/profile`,
                "failure": `${process.env.FRONT_END_APP}/feedback`,
                "pending": `${process.env.FRONT_END_APP}/feedback`,
            },
            notification_url: `${process.env.BACK_END_URL}/ipn`
        }
        try {
            const mercadoPago = await mercadopago.preferences.create(preference)
            //const data = await res.json()
            console.log(mercadoPago.body.sandbox_init_point)
            res.status(200).send(JSON.stringify({ urlPago: mercadoPago.body.sandbox_init_point }));
            //res.send(res)
        } catch (error) {
            console.log(error)
        }
    },
    get: function (req, res) {
        res.json({
            Payment: req.query.payment_id,
            Status: req.query.status,
            MerchantOrder: req.query.merchant_order_id
        });
    },
    ipn: async function (req, res) {
        const { type } = req.query;
        console.log(req.query)  //  { 'data.id': '1308356057', type: 'payment' }
        console.log(req.query.type)
        if (req.query.type == 'payment') {
            console.log(req.query['data.id'])
            try {
                axios.get(`https://api.mercadopago.com/v1/payments/${req.query['data.id']}`,
                    {
                        headers: { 'Authorization': `Bearer ${process.env.API_KEY_MERCADOPAGO}` }
                    })
                    .then(async function (response) {
                        const dataPago = response;
                        // manejar respuesta exitosa
                        if (dataPago.data.status == 'approved') {
                            console.log(dataPago.data.additional_info.items[0].id)
                            const split_IdSteam_CharacterId = dataPago.data.additional_info.items[0].id.split('-')
                            const idSteam = split_IdSteam_CharacterId[0]
                            const idCharacter = split_IdSteam_CharacterId[1]
                            const tierVip = dataPago.data.additional_info.items[0].title
                            const price = dataPago.data.additional_info.items[0].unit_price
                            try {
                                const sendData = await db.collection('buy_vips').add({
                                    steam_id: idSteam,
                                    character_id: idCharacter,
                                    tier_vip: tierVip,
                                    price: price,
                                    status: dataPago.data.status,
                                    active_vip: false,
                                });
                                console.log('Added document with ID: ', sendData.id);
                                res.status(200).send(sendData.id);
                            } catch (error) {
                                console.log(error)
                            }

                        }
                    })
                    .catch(function (error) {
                        // manejar error
                        console.log(error);
                    })

            } catch (error) {
                console.log(error)
            }
        }

    }
}

module.exports = MercadoPago