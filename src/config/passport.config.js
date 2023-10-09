import passport from "passport"
import local from 'passport-local'
import userModel from '../DAO/mongoManager/models/user.model.js'
import GitHubStrategy from 'passport-github2'
import { createHash, isValidPassword } from "../utils.js"

/*

App ID: 405493

Client ID: Iv1.f9814bc313e1f045

Secret: 0071e261345dc0af4c51cd62c46bef7f76dc8262

*/

const LocalStrategy = local.Strategy

const initializePassport = () => {

    passport.use('github', new GitHubStrategy(
        {
            clientID: 'Iv1.f9814bc313e1f045',
            clientSecret: '0071e261345dc0af4c51cd62c46bef7f76dc8262',
            callbackURL: 'http://127.0.0.1:8080/githubcallback'
        }, 
        async(accessToken, refreshToken, profile, done) => {
            console.log(profile)
            try {
                const user = await userModel.findOne({email:profile._json.email})
                if(user) {
                    console.log('User already exists' + email)
                    return done(null, user)
                }

                const newUser = {
                    first_name: profile._json.first_name,
                    last_name: '',
                    age: 18,
                    email: profile._json.email,
                    password:''
                }
                
                const result = await userModel.create(newUser)
                return done(null, result)
            } catch(error) {
                return done('Error to login with Github' + error)
            }
        }
        ))

    passport.use('register', new LocalStrategy(
        {
            passReqToCallback: true,
            usernameField: 'email'
        }, 

        async(req,username,password,done) => {
            const {first_name, last_name, email, age} = req.body
            try{
                const user = await userModel.findOne({email:username})
                if(user) {
                    console.log('User already exists')
                    return done(null,false)
                }

                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password),
                }

                const result = await userModel.create(newUser)
                return done(null,result)
            } catch(error) {
                return done('Error to register' + error)
            }
        }))

    passport.use('login', new LocalStrategy(
        { usernameField: 'email' }, 

        async(username, password, done) => {
            try{
                const user = await userModel.findOne({email:username}).lean().exec()
                if(!user) {
                    console.error('User doesn`t exist')
                    return done(null,false)
                }
                if(!isValidPassword(user, password)) {
                    console.error('Password not valid')
                    return done(null,false)
                }
    
                return done(null,user)
            } catch(error) {
                return done('Error login' + error)
            }
        }))

        passport.serializeUser((user,done) => {
            done(null, user._id)
        })
    
        passport.deserializeUser(async(id, done) => {
            const user = await userModel.findById(id)
            done(null, user)
        })
}

export default initializePassport