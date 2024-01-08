'use strict'
const {
	Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {

  class Album extends Model {
		static associate(models) {
			Album.hasMany(models.Document, {
				as: 'Images'
			})
			Album.hasMany(models.SocialEvent)
		}
	}

	Album.init({
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		date: {
			type: DataTypes.DATEONLY,
			allowNull: false
		}
	}, {
		sequelize,
		modelName: 'Album',
		tableName: 'albums',
		underscored: true
	})
	return Album
}
