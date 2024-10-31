import { sendResponseOk, sendResponseBadReq, tryCatch } from '../../helpers/helper.js';
import { listCart_s } from '../../service/CartService.js';
import { detailProduct_s } from '../../service/ProductService.js';
import { isValidObjectId } from 'mongoose';

export const orderPlace = tryCatch(async (req, res) => {
    let user = req.apiUser;
    let { type, product, quantity } = req.body;

    if (type === "product") {
        if (!isValidObjectId(product) || !(await detailProduct_s({ _id: product }))) {
            return sendResponseBadReq(res, 'Invalid product!');
        }
        if (!quantity || isNaN(quantity)) {
            return sendResponseBadReq(res, 'Invalid quantity or quantity not provided!');
        }
    } else if (type === "cart") {

        let cartItems = await listCart_s(
            {
                user: user._id,
            },
            'product quantity',
            [
                {
                    path: 'product',
                    select: 'category image price rating stock slug strikePrice title',
                    populate: [
                        {
                            path: 'category',
                            select: 'title',
                            match: { isDeleted: false, isActive: true },
                        },
                        { path: 'image', select: 'filename' },
                    ],
                    match: { isDeleted: false, isActive: true },
                },
            ],
        );

        for (let item of cartItems) {
            if (item?.product?.stock < item?.quantity) {
                return sendResponseBadReq(res, "Invalid quantity of product or Product out of stock");
            }
        }

    }

    return sendResponseOk(res, 'Order placed successfully!');
});