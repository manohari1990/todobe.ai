import { Router } from "express";
import { userRegister, userLogin, userLogout, refreshAuthToken } from '../controllers/auth.controller.js';
import { body } from "express-validator";

const UserRegistrationRules = [
    body('username').notEmpty().withMessage("Username should not be empty.").bail()
        .isLength({ min: 6, max: 15 }).withMessage('username length should not less thatn 8 and more than 15 characters.').bail()
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Only alphanumeric values and underscores allowed!'),
         // also provide special char validation
    body('email').isEmail().withMessage('Please enter valid email.').normalizeEmail(),

    body('phone').optional().isMobilePhone("en-IN").withMessage('Please enter valid Phone number.'),

    body('first_name').notEmpty().withMessage('Please enter First Name.').bail()
        .isLength({ min: 2, max: 50 }).withMessage("Please enter valid name").bail()
        .matches(/^[a-zA-Z]+$/).withMessage("Special characters are not allowed!"),

    body('last_name').optional().matches(/^[a-zA-Z]+$/).withMessage("Special characters are not allowed!"),

    body('password').isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }).withMessage("Must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.")
]

const UserLoginRules = [
    body('login').trim().notEmpty().withMessage("Please Enter Username or Email."),
    body('password').trim().notEmpty().withMessage("Please enter password.").bail()
                    .isLength({min: 8}).withMessage("Please enter valid password.")
]

const authRouter = Router()

authRouter.post('/register', UserRegistrationRules, userRegister)
authRouter.post('/login', UserLoginRules, userLogin)
authRouter.post('/logout', userLogout)
authRouter.post('/refresh', refreshAuthToken)

export default authRouter