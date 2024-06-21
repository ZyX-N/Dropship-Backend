export const login = async (req,res) =>{
    return res.status(200).json({ status: "ok", side: "admin" })
}