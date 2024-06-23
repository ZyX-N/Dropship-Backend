import { detailUser_s, insertUser_s } from "../../service/UserService.js";
import { detailRole_s } from "../../service/RoleService.js";
import { matchPassword, getJwtToken, sendResponseOk, sendResponseBadReq, hashPassword, tryCatch } from "../../helpers/helper.js";

export const signup = tryCatch(async (req, res) => {
    let { name, email, mobile, password } = req.body;

    let checkMail = await detailUser_s({ email });
    if (checkMail) return sendResponseBadReq(res, 'Email already exists!');

    let checkMobile = await detailUser_s({ mobile });
    if (checkMobile) return sendResponseBadReq(res, 'Mobile number already exists!');

    const customerRole = await detailRole_s({ title: 'customer' });
    const data = { name, email, mobile, password: await hashPassword(password), role: customerRole._id, type: customerRole.title };
    let insertStatus = await insertUser_s(data);

    if (!insertStatus) return sendResponseBadReq(res, 'User registration failed, try again in sometime!');

    return sendResponseOk(res, 'User registered successfully!', getJwtToken(insertStatus._id));
})

export const signin = tryCatch(async (req, res) => {
    let { username, password } = req.body;
    const key = username.includes('@') ? 'email' : 'mobile'

    let userInfo = await detailUser_s({ [key]: username, type: 'customer' });
    if (!userInfo) return sendResponseBadReq(res, 'Invalid cerdentials!');

    if (!await matchPassword(password, userInfo.password)) return sendResponseBadReq(res, 'Invalid cerdentials!');
    return sendResponseOk(res, 'Logged in successfully!', await getJwtToken({ _id: userInfo._id }));

})