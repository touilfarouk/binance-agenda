import { config } from './config.js';
import Model from './Model.js';
import View from './View.js';
import Controller from './Controller.js';

// After payment verification
config.features.agenda = true; // Enable agenda

const app = new Controller(new Model(), new View());
