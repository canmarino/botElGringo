import { createFlow } from '@builderbot/bot';
import { welcomeFlow } from './welcomeFlow.js'
import { gptFlow } from './gptFlow.js';
import { mainFlow, stopFlow } from './mainFlow.js';
import { DetectIntention } from './intentionsFlow.js';
import { voiceFlow } from './voiceFlow.js';
import { goodbyeFlow } from './goodbye.js';
import { imageFlow } from './imageFlow.js';
import { pdfFlow } from './pdfFlow.js';
//import { flowOnOff } from './mainFlow.js';

export default createFlow([
    welcomeFlow,
    pdfFlow,
    imageFlow,
    gptFlow,
    mainFlow,
    DetectIntention,
    voiceFlow,
    stopFlow,
    goodbyeFlow
]);
