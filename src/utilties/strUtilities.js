import axios from 'axios'

export const parseQuoteStr = (str) => {
  return str.replace( /(<([^>]+)>)/ig, '').replace(/&#8217;/g, "'");
}

export const readStr = async (str) => {
  const newString = str.replace(/ /g, "+");
  const voiceAPI = `http://api.voicerss.org/?key=0bb282d009b0476f9790b9b76954f35e&src=${newString}.&hl=en-us`

  let response = await axios.get(voiceAPI, {  responseType: 'arraybuffer' })

  // Fix Prefixing
  // An AudioContext is for managing and playing all sounds.
  let AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();

  const audioBuffer = await audioContext.decodeAudioData(response.data); // Convert the response array buffer to the audio data
  let source = audioContext.createBufferSource(); // Create a source source
  source.buffer = audioBuffer; // Tell the source which sound to play
  source.connect(audioContext.destination); // Connect the source to the speakers
  source.start(0);  // Start
}
