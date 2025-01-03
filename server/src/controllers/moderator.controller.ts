import { RequestHandler } from "express";
import { sendError, sendSuccess } from "../utils/response";
import prisma from "../config/db";

export const updateListingStatus: RequestHandler = async (req, res): Promise<void> => {
    try {
        const { id } = req.params;
        const {status, reason} = req.body;

        const listing = await prisma.listing.update({
            where: { id: parseInt(id) },
            data: {
                status,
            }
        })

        // log moderation action
        await prisma.moderationLog.create({
            data: {
                moderatorId: req.user!.id,
                listingId: parseInt(id),
                action: status,
                reason,
            }
        })

        res.status(200).json(sendSuccess(listing));
    } catch (error) {
        res.status(500).json(sendError((error as Error).message));
    }
}