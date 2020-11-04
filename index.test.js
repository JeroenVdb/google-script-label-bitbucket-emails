const rewire = require('rewire');

const app = rewire('./index.js');

init = app.__get__('init');

function createMockedMessage(body) {
	return {
		getBody: function() {
			return body
		},
		getSubject: function() {
			return 'foobar';
		}
	}
}

function createMockedThread(messages) {
	return {
		labels: [],
		getMessages: function() {
			return messages
		},
		addLabel: function(label) {
			this.labels.push(label);
		},
		moveToArchive: function() {
		},
		markRead: function() {
		}
	}
}

GmailAppMock = {
	search: function (query, start, end) {
		return [threadAsAuthor, threadAsReviewer, threadAsAuthorWithMergeMessage, threadAsReviewerWithMergeMessage];
	},
	getUserLabelByName: function(label) {
		return label
	}
}

const mergedMessage = createMockedMessage('MERGED pull request');
const youAreReviewerMessage = createMockedMessage('added you as a reviewer on pull request');
const randomMessage = createMockedMessage('foobar');

const threadAsAuthor = createMockedThread([randomMessage]);
const threadAsReviewer = createMockedThread([youAreReviewerMessage]);
const threadAsAuthorWithMergeMessage = createMockedThread([randomMessage, mergedMessage]);
const threadAsReviewerWithMergeMessage = createMockedThread([youAreReviewerMessage, mergedMessage]);

app.__set__('GmailApp', GmailAppMock);

describe('Acceptance test', function() {
	it('Should find 4 emails', function() {
		expect(init()).toBe(4);
	});

	it('Should archive and mark as read if merged', function() {
		const spyForThreadAsAuthorWithMergeMessageArchive = jest.spyOn(threadAsAuthorWithMergeMessage, 'moveToArchive');
		const spyForThreadAsAuthorWithMergeMessageRead = jest.spyOn(threadAsAuthorWithMergeMessage, 'markRead');
		const spyForThreadAsReviewerWithMergeMessageArchive = jest.spyOn(threadAsReviewerWithMergeMessage, 'moveToArchive');
		const spyForThreadAsReviewerWithMergeMessageRead = jest.spyOn(threadAsReviewerWithMergeMessage, 'markRead');
		const spyForThreadAsAuthorArchive = jest.spyOn(threadAsAuthor, 'moveToArchive')
		const spyForThreadAsAuthorRead = jest.spyOn(threadAsAuthor, 'markRead')
		const spyForThreadAsReviewerArchive = jest.spyOn(threadAsReviewer, 'moveToArchive')
		const spyForThreadAsReviewerRead = jest.spyOn(threadAsReviewer, 'markRead')

		expect(init()).toBe(4);

		expect(spyForThreadAsAuthorWithMergeMessageArchive).toHaveBeenCalledTimes(1);
		expect(spyForThreadAsAuthorWithMergeMessageRead).toHaveBeenCalledTimes(1);
		expect(spyForThreadAsReviewerWithMergeMessageArchive).toHaveBeenCalledTimes(1);
		expect(spyForThreadAsReviewerWithMergeMessageRead).toHaveBeenCalledTimes(1);

		expect(spyForThreadAsAuthorArchive).toHaveBeenCalledTimes(0);
		expect(spyForThreadAsAuthorRead).toHaveBeenCalledTimes(0);
		expect(spyForThreadAsReviewerArchive).toHaveBeenCalledTimes(0);
		expect(spyForThreadAsReviewerRead).toHaveBeenCalledTimes(0);
	});

	it('Should add the correct labels', function() {
		expect(init()).toBe(4);

		expect(threadAsAuthorWithMergeMessage.labels).toContain('Bitbucket/Author');
		expect(threadAsAuthorWithMergeMessage.labels).toContain('Bitbucket/Merged');

		expect(threadAsAuthor.labels).toContain('Bitbucket/Author');

		expect(threadAsReviewerWithMergeMessage.labels).toContain('Bitbucket/Reviewer');
		expect(threadAsReviewerWithMergeMessage.labels).toContain('Bitbucket/Merged');

		expect(threadAsReviewer.labels).toContain('Bitbucket/Reviewer');
	});
});
