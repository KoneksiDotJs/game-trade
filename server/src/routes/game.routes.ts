import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { upload } from "../middleware/multer";
import { createGame, deleteGame, getGameById, getGames, updateGame } from "../controllers/game.controller";

const router = Router();

router.post('/', authenticate, upload.single('image'), createGame)
router.get('/', getGames)
router.get('/:id', getGameById)
router.put('/:id', authenticate, upload.single('image'), updateGame)
router.delete('/:id', authenticate, deleteGame)

export default router;