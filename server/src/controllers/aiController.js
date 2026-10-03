import { summarizeText, classifyEntity, generateRecommendations, chatAssistant } from '../services/aiService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * @desc    Summarize text or document
 * @route   POST /api/ai/summarize
 * @access  Private
 */
export const summarize = async (req, res, next) => {
  try {
    const { text, options } = req.body;
    if (!text) {
      return sendError(res, { statusCode: 400, message: 'Text is required for summarization' });
    }

    const result = await summarizeText(text, options);
    return sendSuccess(res, {
      message: 'Text summarized successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Classify/categorize text into category and priority
 * @route   POST /api/ai/classify
 * @access  Private
 */
export const classify = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return sendError(res, { statusCode: 400, message: 'Text is required for classification' });
    }

    const result = await classifyEntity(text);
    return sendSuccess(res, {
      message: 'Entity classified successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate personalized recommendations
 * @route   POST /api/ai/recommendations
 * @access  Private
 */
export const getRecommendations = async (req, res, next) => {
  try {
    const context = {
      role: req.user?.role || 'user',
      ...req.body,
    };

    const result = await generateRecommendations(context);
    return sendSuccess(res, {
      message: 'Recommendations generated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Assistant Chatbot
 * @route   POST /api/ai/chat
 * @access  Private
 */
export const chat = async (req, res, next) => {
  try {
    const { message, chatHistory } = req.body;
    if (!message) {
      return sendError(res, { statusCode: 400, message: 'Message prompt is required' });
    }

    const result = await chatAssistant(message, chatHistory);
    return sendSuccess(res, {
      message: 'AI response generated',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  summarize,
  classify,
  getRecommendations,
  chat,
};
