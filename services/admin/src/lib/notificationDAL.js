const Joi = require('joi');

const notificationSchema = Joi.object({
  _id: Joi.string().required(),
  userId: Joi.string().required(),
  type: Joi.string().valid('booking', 'message', 'alert', 'promotion', 'system').default('alert'),
  channel: Joi.string().valid('in_app', 'sms', 'email', 'push').default('in_app'),
  message: Joi.string().required(),
  relatedEntityId: Joi.string().required(),
  read: Joi.boolean().default(false),
  priority: Joi.string().valid('low', 'normal', 'high').default('normal'),
  metadata: Joi.object({
    additionalData: Joi.object(),
    actionLink: Joi.string().uri()
  }),
  isSystemNotification: Joi.boolean().default(false),
  expires_at: Joi.date(),
  created_at: Joi.date().default(new Date()),
  updated_at: Joi.date().default(new Date())
});

module.exports = {
  notificationSchema
};
