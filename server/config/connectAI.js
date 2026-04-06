
const {GoogleGenAI}=require('@google/genai');
const AI=new GoogleGenAI({
  // apiKey: process.env.GEMINI_API_KEY,
});
  exports.connectAI = async (data) => {
    try {
      const response = await AI.models.generateContent({
       model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: data }],
        },
      ],
    });
      // console.log("reponse",response.text);
  return response.text;
    } catch (error) {
      // console.log(error);
      throw error;
    }
}