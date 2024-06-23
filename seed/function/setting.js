import Setting from "../../src/model/Setting.js";

export const createSetting = async (data) => {
    try {
        if ((await Setting.find()).length > 0) {
            console.log("Settings already exists! skipped!")
            return null;
        }
        await Setting.create({
            name: data.name,
            logo: data.logo,
            instagram: data.instagram,
            facebook: data.facebook
        });
        console.log(`Settings created successfully!`);
    } catch (error) {
        console.log(error);
        return null;
    }
};