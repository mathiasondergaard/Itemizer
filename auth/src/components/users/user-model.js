const db = require('../../db');
const Role = require('./role-model');

const User = db.sequelize.define('users', {
    username: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Name cannot be empty'
            },
        },
    },
    email: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Description cannot be empty!'
            },
        },
    },
    password: {
        type: db.Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: 'Description cannot be empty!'
            },
        },
    },
    isVerified: {
        type: db.Sequelize.BOOLEAN,
        allowNull: false,
        default: false,
        validate: {
            allowNull: false,
        },
        //todo: is not added to other layers yet
    },
    employee_id: {
        //todo: do this model
    }
});

User.belongsToMany(db.sequelize.models.roles, {
    through: 'user_roles',
    as: 'roles',
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});

Role.belongsToMany(db.sequelize.models.users, {
    through: 'user_roles',
    as: 'roles',
    foreignKey: 'role_id'
})

module.exports = User;

