import { test } from 'qunit';
import moduleForAcceptance from 'travis/tests/helpers/module-for-acceptance';
import sidebarPage from 'travis/tests/pages/sidebar';

moduleForAcceptance('Acceptance | home/sidebar tabs', {
  beforeEach() {
    const currentUser = server.create('user', {
      name: 'Sara Ahmed',
      login: 'feministkilljoy'
    });

    signInUser(currentUser);

    // create active repo
    server.create('repository', {
      slug: 'killjoys/living-a-feminist-life'
    });

    // create active repo
    let testRepo = server.create('repository', {
      slug: 'killjoys/willful-subjects'
    });

    let otherRepo = server.create('repository', {
      slug: 'other/other',
      skipPermissions: true
    });

    let commit = server.create('commit', {
      author_email: 'mrt@travis-ci.org',
      author_name: 'Mr T',
      committer_email: 'mrt@travis-ci.org',
      committer_name: 'Mr T',
      branch: 'acceptance-tests',
      message: 'This is a message',
      branch_is_default: true
    });

    let build = server.create('build', {
      repository: testRepo,
      state: 'queued',
      commit,
      branch: server.create('branch', {
        name: 'acceptance-tests'
      })
    });

    let job = server.create('job', {
      number: '1234.1',
      repository: testRepo,
      state: 'queued',
      commit,
      build
    });

    let otherCommit = server.create('commit');
    let otherBuild = server.create('build', {
      repository: otherRepo,
      commit: otherCommit,
      state: 'queued'
    });
    server.create('job', {
      repository: otherRepo,
      commit: otherCommit,
      build: otherBuild,
      state: 'started'
    });

    let otherCreatedBuild = server.create('build', {
      repository: otherRepo,
      commit: otherCommit,
      state: 'created'
    });
    server.create('job', {
      repository: otherRepo,
      commit: otherCommit,
      build: otherCreatedBuild,
      state: 'created'
    });

    commit.job = job;

    job.save();
    commit.save();
  }
});

test('the home page shows running tab', (assert) => {
  sidebarPage
    .visit()
    .clickSidebarRunningTab();

  andThen(() => {
    assert.equal(sidebarPage.sidebarRunningTabText, 'Running1 / 1', 'running tab correctly shows number of started/queued jobs');
    assert.equal(sidebarPage.sidebarRunningRepositories().count, 1, 'expected one running repositories');
  });
  percySnapshot(assert);
});

test('maintains sidebar tab state when viewing running job', (assert) => {
  sidebarPage
    .visit()
    .clickSidebarRunningTab()
    .viewRunningJob();

  andThen(() => {
    assert.ok(sidebarPage.runningTabIsActive, 'running tab state should persist across route transitions');
  });
});
