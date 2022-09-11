const employeeRepository = require('./employee-repository');
const {service: authService} = require('../auth');
const {AppError} = require('../../error');
const db = require('../../db');

exports.create = async (body) => {

    const transaction = await db.sequelize.transaction();

    //if title is null, default will be used
    const employeeToCreate = {
        name: body.name,
        email: body.email,
        phone: body.phone,
        title: body.title,
        address: body.address,
    };

    const employeeIsCreated = await employeeRepository.create(employeeToCreate, transaction);

    if (!employeeIsCreated) {
        await transaction.rollback();
        return false;
    }

    const userIsCreated = await fetch(`${process.env.AUTH_URI}/users`, {
        method: 'POST',
        body: JSON.stringify({name: employeeIsCreated.name, title: employeeIsCreated.title, email: employeeIsCreated.email}),
    });

    if (userIsCreated.status !== 201) {
        await transaction.rollback();
        return false;
    }

    await transaction.commit();

    return true;
};

exports.delete = async (id) => {
    return await employeeRepository.delete(id);
};

exports.findAll = async () => {
    return await employeeRepository.findAll();
};

exports.findMultipleByIds = async (ids) => {
    return await employeeRepository.findMultipleByIds(ids);
};

exports.findAllEmployeesNamesAndIds = async () => {
    return await employeeRepository.findAllEmployeesNamesAndIds();
};

exports.findById = async (id) => {
    return await employeeRepository.findById(id);
};

exports.updateTitle = async (employeeToUpdate, loggedInEmployee) => {

    const employeeTitle = await employeeRepository.findTitleById(loggedInEmployee.id);
    if (!employeeTitle) {
        return false;
    }
    if (employeeTitle !== 'Manager') {
        throw new AppError(`Employee ${loggedInEmployee.id} title could not be updated, invalid permission!`, 401, true);
    }

    const titleValidation = ['WORKER', 'SUPERVISOR', 'MANAGER'];

    if (!titleValidation.includes(employeeToUpdate.status.toUpperCase())) {
        throw new AppError(`Failed to update title - invalid title! ${employeeToUpdate.title}`, 500, true);
    }

    const message = employeeRepository.updateTitle(employeeToUpdate);

    return {
        message: message,
        title: employeeToUpdate.title
    };
};


exports.findEmployeeDetails = async (id) => {
    const employee = await employeeRepository.findById(id);
    const address = employee.address;

    delete employee.address;

    if (!employee) {
        return false;
    }

    return {
        employee: employee,
        address: address,
    };
};

exports.findNameById = async (id) => {
    return await employeeRepository.findNameById(id);
};

exports.findNameAndTitleById = async (id) => {
    return await employeeRepository.findNameAndTitleById(id);
};

exports.updateOwnDetails = async (details) => {
    const employeeToUpdate = {
        id: details.employee.id,
        name: details.employee.name,
        email: details.employee.email,
        phone: details.employee.phone,
        address: details.employee.address,
    };

    const updatedEmployee = await employeeRepository.update(employeeToUpdate);

    if (!updatedEmployee) {
        return false;
    }

    return true;
}

exports.update = async (employee, currentEmployeeId) => {
    const transaction = await db.sequelize.transaction();

    if (currentEmployeeId !== parseInt(employee.id)) {
        const employeeTitle = await employeeRepository.findTitleById(employee.id);
        if (!employeeTitle) {
            return false;
        }
        if (employeeTitle !== 'Supervisor' && employeeTitle !== 'Manager') {
            throw new AppError(`Employee ${employee.id} could not be updated, invalid permission!`, 401, true);
        }
    }

    const employeeToUpdate = {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        address: employee.address,
    };

    const updated = await employeeRepository.update(employeeToUpdate, transaction);

    if (!updated) {
        await transaction.rollback();
        return false;
    }

    await transaction.commit();

    return updated;
};

