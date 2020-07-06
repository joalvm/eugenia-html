import { series } from 'gulp';
import typescript from './gulp/tasks/scripts.task';
import scss from './gulp/tasks/styles.task';
import html from './gulp/tasks/html.task';


exports.default = series(scss, typescript, html)