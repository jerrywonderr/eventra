import { mintTicketNFT } from "../hedera/mintTicket.js";
import { Request, Response } from "express";

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { eventName, eventSymbol } = req.body;

    const tokenId = await mintTicketNFT(eventName, eventSymbol);

    return res.status(201).json({
      success: true,
      message: "Event token created successfully!",
      tokenId,
    });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, message });
  }
};
