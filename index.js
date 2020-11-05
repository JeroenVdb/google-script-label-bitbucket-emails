const debugEnabled = true;

const LABEL = {
	AUTHOR: 'Bitbucket/Author',
	REVIEWER: 'Bitbucket/Reviewer',
	MERGED: 'Bitbucket/Merged'
}

function init() {
	const threads = getBitbucketEmails();

	debug(`threads found: ${threads.length}`);

	const reviewerPullRequests = threads.filter(iAmReviewer);
	const authoredPullRequests = threads.filter(iAmAuthor);
	const mergedPullRequests = threads.filter(isMerged);

	debug(`authoredPullRequests threads found: ${authoredPullRequests.length}`);
	debug(`reviewerPullRequests threads found: ${reviewerPullRequests.length}`);
	debug(`mergedPullRequests threads found: ${mergedPullRequests.length}`);

	authoredPullRequests.map(addAuthorLabel);
	reviewerPullRequests.map(addReviewerLabel);
	mergedPullRequests.map(addMergedLabel);
	mergedPullRequests.map(silenceThread);

	return threads.length;
}

function iAmReviewer(thread) {
	return thread.getMessages()[0].getBody().includes('added you as a reviewer on pull request');
}

function iAmAuthor(thread) {
	return !thread.getMessages()[0].getBody().includes('added you as a reviewer on pull request');
}

function isMerged(thread) {
	const mergedThreads = thread.getMessages().filter(message => {
		return message.getPlainBody().includes('been pulled into develop');
	});

	return mergedThreads.length > 0;
}

function addAuthorLabel(thread) {
	return addLabel(thread, LABEL.AUTHOR);
}

function addReviewerLabel(thread) {
	return addLabel(thread, LABEL.REVIEWER);
}

function addMergedLabel(thread) {
	return addLabel(thread, LABEL.MERGED);
}

function addLabel(thread, labelStr) {
	const label = GmailApp.getUserLabelByName(labelStr);
	return thread.addLabel(label)
}

function silenceThread(thread) {
	debug(`Silence thread: ${thread.getMessages()[0].getSubject()}`);
	thread.moveToArchive();
	thread.markRead();
	return thread;
}

function getBitbucketEmails() {
	return GmailApp.getInboxThreads().filter(isFromBitbucket);
}

function isFromBitbucket(thread) {
	return thread.getMessages()[0].getFrom().includes('pullrequests-reply@bitbucket.org');
}

function logger(str) {
	console.log(str);
}

function debug(str) {
	if (debugEnabled) {
		logger(str);
	}
}

function setupTriggers() {
	const triggers = ScriptApp.getProjectTriggers();

	if (triggers.length === 0) {
		ScriptApp.newTrigger('init')
			.timeBased()
			.everyMinutes(1)
			.create();
	}
}
