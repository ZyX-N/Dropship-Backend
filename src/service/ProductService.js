import Product from "../model/Product.js";

const filter = { isDeleted: false };
const unselect = " -isDeleted"

export const insertProduct_s = async (args = {}) => {
    let query = Product.create(args);
    return await query;
}

export const listProduct_s = async (search = "", pagination = false, page = 1, count = 10) => {
    let data = null;
    let totalCount = 0;

    let pipeline = [
        { $match: { ...filter } },
        {
            $lookup: {
                from: 'categories',
                foreignField: '_id',
                localField: 'category',
                as: 'category',
                pipeline: [{ $match: { isDeleted: false } }, { $project: { isDeleted: 0, createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, __v: 0 } }]
            }
        },
        {
            $unwind: { path: '$category', preserveNullAndEmptyArrays: true }
        },
        {
            $match: {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { hindiTitle: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { hindiDescription: { $regex: search, $options: 'i' } },
                ]
            }
        },
        {
            $project: {
                isDeleted: 0,
                createdBy: 0,
                updatedBy: 0,
                createdAt: 0,
                updatedAt: 0,
                __v: 0,
            }
        }
    ]

    let countQuery = await Product.aggregate([...pipeline, ...[{ $count: 'totalCount' }]]);
    totalCount = countQuery[0].totalCount;

    if (pagination) {
        pipeline.push(
            { $skip: (page - 1) * count },
            { $limit: count }
        );
    }

    data = await Product.aggregate(pipeline);
    return { totalCount, data };
}

export const detailProduct_s = async (args = {}, select = "", populate = []) => {
    let query = Product.findOne({ ...filter, ...args }).populate(populate || []).select(select || unselect).lean();
    return await query;
}

export const updateProduct_s = async (args = {}, data = {}) => {
    let query = Product.findOneAndUpdate({ ...filter, ...args }, data);
    return await query;
}

export const deleteProduct_s = async (args = {}) => {
    let query = Product.findOneAndUpdate({ ...filter, ...args }, { isDeleted: true });
    return await query;
}