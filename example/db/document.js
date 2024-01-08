'use strict'
const {
	Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	
	class Document extends Model {
		static associate (models) {
			Document.belongsTo(models.SocialEvent, {
				foreignKey: 'social_event_id',
				onDelete: 'CASCADE'
			})
			Document.belongsTo(models.Album, {
				foreignKey: 'album_id',
				onDelete: 'CASCADE'
			})
			Document.belongsTo(models.User, {
        as: 'Author',
				foreignKey: 'author_id',
				onDelete: 'CASCADE'
			})
		}
	}

	Document.init({
		file_path: {
			type: DataTypes.STRING(500),
			allowNull: false
		},
		file_name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		mime_type: DataTypes.STRING(100),
		size: DataTypes.DOUBLE,
		model: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		thumbnail_path: DataTypes.STRING,
		note: DataTypes.TEXT
	}, {
		sequelize,
		modelName: 'Document',
		tableName: 'documents',
		underscored: true
	})

	return Document
}
