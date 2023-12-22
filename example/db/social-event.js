'use strict'
const {
	Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	
	class SocialEvent extends Model {
		static associate(models) {
			SocialEvent.belongsTo(models.Album, {
				foreignKey: 'album_id',
				onDelete: 'SET NULL'
			})
			SocialEvent.hasOne(models.Document)
		}
	}

	SocialEvent.init({
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		start_date: {
			type: DataTypes.DATEONLY,
			allowNull: false
		},
		end_date: {
			type: DataTypes.DATEONLY,
			allowNull: false
		},
	}, {
		sequelize,
		modelName: 'SocialEvent',
		tableName: 'social_events',
		underscored: true
	})
	return SocialEvent
}
