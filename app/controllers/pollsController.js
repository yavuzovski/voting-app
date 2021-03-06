'use strict';

const ObjectId = require('mongoose').Types.ObjectId;
const polls = require('../models/polls.js');

function getAllPolls() {
    return polls.find();
}

function convertOptions(optionsStr, delimeter) {
    // converts options string to => [{ name: optionName, count: 0 }]
    return optionsStr.split(delimeter).reduce((results, option) => {
        if(option !== "")
            results.push({ name: option, count: 0 });
        return results;
    }, []);
}

function createPoll(title, options) {
    let doc = {
        title: title,
        options: convertOptions(options, "\r\n"),
        votedPeople: [],
        creationTime: new Date()
    };
    return polls.insertMany(doc);
}

function getPoll(pollId) {
    return polls.findById(pollId);
}

function deletePoll(pollId) {
    let query = { _id: pollId };
    return polls.deleteOne(query);
}

async function isVoted(person, pollId) {
    let poll = await getPoll(pollId);
    for(let votedPerson of poll.votedPeople) {
        if(person === votedPerson.toString())
            return true;
    }
    return false;
}

async function votePoll(pollId, votedOptionId, votedPerson) {
    // update votedPeople and voted option's count fields
    votedOptionId = ObjectId(votedOptionId);
    let query = { _id: pollId };
    let doc = { $push: { votedPeople: votedPerson }, $inc: { 'options.$[option].count': 1 } };
    let options = { new: true, arrayFilters: [ { 'option._id': votedOptionId } ] };
    return await polls.findOneAndUpdate(query, doc, options);
}

async function pushOptions(pollId, optionNames) {
    let query = { _id: pollId };
    let doc = { $push: { options: convertOptions(optionNames, '\n') } };
    let options = { new: true };
    return await polls.findOneAndUpdate(query, doc, options);
}

module.exports = { getAllPolls, createPoll, getPoll, deletePoll, isVoted, votePoll, pushOptions };
