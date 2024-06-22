import { detailUser_s } from "../../service/UserService.js";
import { matchPassword, getJwtToken, sendResponseOk, sendResponseBadReq } from "../../helpers/helper.js";

export const login = async (req, res) => {
    let { username, password } = req.body;
    const key = username.includes('@') ? 'email' : 'mobile'

    let userInfo = await detailUser_s({ [key]: username, type: 'admin' });
    if (!userInfo) return sendResponseBadReq(res, 'Invalid cerdentials!');

    if (!await matchPassword(password, userInfo.password)) return sendResponseBadReq(res, 'Invalid cerdentials!');
    return sendResponseOk(res, 'Logged in successfully!', await getJwtToken({ _id: userInfo._id }));
}