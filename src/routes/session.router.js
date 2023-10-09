import { Router } from 'express'
import UserModel from '../DAO/mongoManager/models/user.model.js'
import passport from 'passport'
import { createHash, isValidPassword } from '../utils.js'

const router = Router()

//Logueo
router.post('/login', passport.authenticate('login', '/login'), async (req, res) => {
    //Verificacion para el administrador
    const loginAdmin = req.body
    if (loginAdmin.email === 'adminCoder@coder.com' && loginAdmin.password === 'adminCod3r123') {
        req.session.user = {
            first_name: 'Admin',
            email: 'adminCoder@coder.com',
            role: 'admin'
        }
        return res.redirect('/home')
    }

    //const { email, password } = req.body
    //const user = await UserModel.findOne({ email })
    //if (!user) {
    //    console.log('Not found the user')
    //    return res.redirect('/login')
    //}
    //if (!isValidPassword(user, password)) { //Validacion del hash
    //    console.log('Password not valid')
    //    return res.redirect('/login')
    //}

    if(!req.user) return res.status(400).send('Invalid credentials')

    req.session.user = req.user
    return res.redirect('/products')
})

//Registro
router.post('/register', passport.authenticate('register', {failureRedirect: '/register'}) , async (req, res) => {

    //try {
    //  const user = req.body
    //  user.password = createHash(user.password) //Hasheo de contraseña
    //  const result = await UserModel.create(user)
    //  console.log(result)
    //} catch (error) {
    //  res.status(500).json({ error: 'Failed to register the user' });

    return res.redirect('/login')})

//Deslogueo
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.render("profile", { error: "No se pudo cerrar la sesion" })

        return res.redirect('/login')
    })
})

//Github
router.get(
    '/login-github',
    passport.authenticate('github', {scope: ['user:email']}),
    async(req,res) => {}
    )

router.get(
    '/githubcallback',
    passport.authenticate('github', {failureRedirect: '/'}),
    async(req,res) => {
        console.log('Callback: ', req.user)
        req.session.user = req.user
        console.log(req.session)
        res.redirect('/profile')
    }
)

export default router