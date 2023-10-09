import { SpatialPong } from "./logic/classes/spatialGame.class";
import '../assets/style.css';

const spatialGame = new SpatialPong("spatial", "ArrowUp", "ArrowDown");
spatialGame.loadGame();
