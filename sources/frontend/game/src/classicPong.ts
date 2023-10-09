import { classicPong } from "./logic/classes/classicGame.class";
import '../assets/style.css';

const classicGame = new classicPong("classic", "ArrowUp", "ArrowDown");
classicGame.loadGame();