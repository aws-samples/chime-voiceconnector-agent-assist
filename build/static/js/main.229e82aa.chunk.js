(this.webpackJsonpnotes = this.webpackJsonpnotes || []).push([
  [0],
  {
    112: function(e, t) {},
    118: function(e, t) {},
    205: function(e, t, a) {
      'use strict';
      (function(e) {
        a.d(t, 'a', function() {
          return o;
        });
        var n = a(27),
          r = a.n(n),
          s = a(20),
          c = a(46),
          i = a(51);
        const l = c.a.aws_project_region;
        function o(t, a, n, c) {
          return s.b.currentCredentials().then(o => {
            const d = new r.a.Lambda({ region: l, credentials: s.b.essentialCredentials(o) }),
              u = { FunctionName: i.c, InvocationType: 'RequestResponse' };
            return (
              (u.Payload = e.from(
                JSON.stringify({
                  bucket: t,
                  oneAudioObject: a,
                  otherAudioObject: n,
                  transactionId: c,
                })
              )),
              d
                .invoke(u)
                .promise()
                .then(e => {
                  const t = JSON.parse(e.Payload).body;
                  if (void 0 !== t) {
                    const e = t.url;
                    return void 0 === e ? '' : e;
                  }
                  return '';
                })
            );
          });
        }
        r.a.config.update({ region: l });
      }.call(this, a(12).Buffer));
    },
    222: function(e, t, a) {
      e.exports = a(715);
    },
    227: function(e, t, a) {},
    46: function(e, t, a) {
      'use strict';
      t.a = {
        aws_project_region: 'us-east-1',
        aws_cognito_identity_pool_id: 'us-east-1:da548ad1-04e6-4632-9a07-1442e38c4763',
        aws_cognito_region: 'us-east-1',
        aws_user_pools_id: 'us-east-1_LXVMQXoVD',
        aws_user_pools_web_client_id: '2d8pv68eepg1e0brtr0f67pi7u',
        oauth: {},
        aws_appsync_graphqlEndpoint:
          'https://hyrd63b2frd2bktcsiclvpzkii.appsync-api.us-east-1.amazonaws.com/graphql',
        aws_appsync_region: 'us-east-1',
        aws_appsync_authenticationType: 'API_KEY',
        aws_appsync_apiKey: 'da2-sk4dq4wjzjbl3lxsxzltgd2ja4',
        aws_content_delivery_bucket: 'chime-vc-agentassist-083981752084-hostingbucket-dev',
        aws_content_delivery_bucket_region: 'us-east-1',
        aws_content_delivery_url:
          'http://chime-vc-agentassist-083981752084-hostingbucket-dev.s3-website-us-east-1.amazonaws.com',
      };
    },
    51: function(e, t, a) {
      'use strict';
      a.d(t, 'f', function() {
        return n;
      }),
        a.d(t, 'e', function() {
          return r;
        }),
        a.d(t, 'd', function() {
          return s;
        }),
        a.d(t, 'c', function() {
          return c;
        }),
        a.d(t, 'b', function() {
          return i;
        }),
        a.d(t, 'a', function() {
          return l;
        });
      const n = 'TranscriptSegment',
        r = {
          TRANSACTION_ID: 'TransactionId',
          CALL_ID: 'CallId',
          START_TIME: 'StartTime',
          SPEAKER: 'Speaker',
          END_TIME: 'EndTime',
          SEGMENT_ID: 'SegmentId',
          TRANSCRIPT: 'Transcript',
          LOGGED_ON: 'LoggedOn',
          IS_PARTIAL: 'IsPartial',
          IS_FINAL: 'IsFinal',
        },
        s = 'chime-search-transcript-and-audio',
        c = 'chime-retrieve-merged-audio-url',
        i = 10,
        l = { WAVFILE: 'wavfile', METADATA: 'metadata', TRANSCRIPT: 'transcript' };
    },
    65: function(e, t, a) {
      'use strict';
      (function(e) {
        a.d(t, 'a', function() {
          return d;
        }),
          a.d(t, 'c', function() {
            return u;
          }),
          a.d(t, 'd', function() {
            return m;
          }),
          a.d(t, 'b', function() {
            return p;
          });
        var n = a(27),
          r = a.n(n),
          s = a(20),
          c = a(46),
          i = a(51);
        const l = c.a.aws_project_region;
        r.a.config.update({ region: l });
        const o = { searchFunctionName: i.d, transcriptTableName: i.f, maxRecords: i.b };
        function d(e, t) {
          return s.b
            .currentCredentials()
            .then(a =>
              new r.a.S3({
                region: l,
                credentials: s.b.essentialCredentials(a),
                signatureVersion: 'v4',
              }).getSignedUrlPromise('getObject', { Bucket: e, Key: t })
            );
        }
        function u(t) {
          return s.b.currentCredentials().then(a => {
            const n = new r.a.Lambda({ region: l, credentials: s.b.essentialCredentials(a) }),
              c = { FunctionName: o.searchFunctionName, InvocationType: 'RequestResponse' },
              d = {
                index: i.a.WAVFILE,
                type: '_doc',
                body: {
                  size: 2,
                  query: { query_string: { default_field: i.e.TRANSACTION_ID, query: t } },
                },
                output: ['Bucket', 'Key', 'Time'],
              };
            return (
              (c.Payload = e.from(JSON.stringify(d))),
              n
                .invoke(c)
                .promise()
                .then(e => {
                  const t = JSON.parse(e.Payload).body;
                  return void 0 === t || t === [] ? [] : JSON.parse(e.Payload).body.Records;
                })
            );
          });
        }
        function m(e) {
          return s.b.currentCredentials().then(t => {
            const a = new r.a.DynamoDB.DocumentClient({
                region: l,
                credentials: s.b.essentialCredentials(t),
              }),
              n = {
                TableName: o.transcriptTableName,
                KeyConditionExpression: '#id = :id',
                ExpressionAttributeNames: { '#id': i.e.TRANSACTION_ID },
                ExpressionAttributeValues: { ':id': e },
              };
            return a
              .query(n)
              .promise()
              .then(e => (0 === e.Count ? [] : e.Items.filter(e => !0 !== e.IsFinal)));
          });
        }
        function p(e) {
          return Promise.all([E(e), h(e)])
            .then(t => {
              const a = t[0],
                n = t[1];
              return Promise.all([
                e,
                a.map(e =>
                  h(e.TransactionId).then(e => {
                    if (1 === e.length) return e[0];
                  })
                ),
                n,
              ]);
            })
            .then(e => {
              const t = [...e[1], ...e[2]].map(e => {
                const t =
                  void 0 !== e.fromNumber || null !== e.fromNumber ? e.fromNumber : 'Unknown';
                return {
                  TransactionId: e.transactionId,
                  Direction: e.direction,
                  StartTimeEpochSeconds: Math.ceil(new Date(e.startTime) / 1e3),
                  EndTimeEpochSeconds: Math.ceil(new Date(e.endTime) / 1e3),
                  SourcePhoneNumber: t,
                };
              });
              return new Promise(e => e(t));
            });
        }
        function h(t) {
          return s.b.currentCredentials().then(a => {
            const n = new r.a.Lambda({ region: l, credentials: s.b.essentialCredentials(a) }),
              c = { FunctionName: o.searchFunctionName, InvocationType: 'RequestResponse' },
              d = {
                index: i.a.METADATA,
                type: '_doc',
                body: {
                  size: o.maxRecords,
                  sort: { startTime: { order: 'desc' } },
                  query: { multi_match: { type: 'best_fields', query: t } },
                },
                output: [],
              };
            return (
              (c.Payload = e.from(JSON.stringify(d))),
              n
                .invoke(c)
                .promise()
                .then(e => {
                  const t = JSON.parse(e.Payload).body;
                  return void 0 === t || t === [] ? [] : JSON.parse(e.Payload).body.Records;
                })
            );
          });
        }
        function E(t) {
          return s.b.currentCredentials().then(a => {
            const n = new r.a.Lambda({ region: l, credentials: s.b.essentialCredentials(a) }),
              c = { FunctionName: o.searchFunctionName, InvocationType: 'RequestResponse' },
              d = {
                index: i.a.TRANSCRIPT,
                type: '_doc',
                body: {
                  size: o.maxRecords,
                  query: { match: { Transcript: { query: t, operator: 'and' } } },
                },
                output: [],
              };
            return (
              (c.Payload = e.from(JSON.stringify(d))),
              n
                .invoke(c)
                .promise()
                .then(e => {
                  const t = JSON.parse(e.Payload).body;
                  return void 0 === t || t === [] ? [] : JSON.parse(e.Payload).body.Records;
                })
            );
          });
        }
      }.call(this, a(12).Buffer));
    },
    709: function(e, t, a) {},
    710: function(e, t, a) {},
    711: function(e, t, a) {},
    714: function(e, t, a) {},
    715: function(e, t, a) {
      'use strict';
      a.r(t);
      var n = a(0),
        r = a.n(n),
        s = a(23),
        c = a.n(s),
        i = (a(227), a(74)),
        l = a(764),
        o = a(762),
        d = a(27),
        u = a.n(d),
        m = a(20),
        p = a(46);
      const h = p.a.aws_project_region;
      u.a.config.update({ region: h });
      a(709);
      var E = a(61),
        g = a.n(E),
        v = a(83),
        b = a(211);
      const S = p.a.aws_project_region;
      function T(e) {
        const t = f(e);
        return (
          m.b.currentCredentials().then(e => {
            const a = new u.a.Comprehend({ region: S, credentials: m.b.essentialCredentials(e) });
            t.forEach((e, t) => {
              if ('spk_0' !== e.Speaker) {
                const n = { LanguageCode: 'en', Text: e.Transcript };
                a.detectSentiment(n, (a, n) => {
                  !(function(e, t, a, n) {
                    if (
                      (e
                        ? console.error(e)
                        : n.SentimentScore.Negative > 0.4
                        ? ((t.Sentiment = '-  '.concat(n.SentimentScore.Negative.toFixed(2))),
                          (t.SentimentClass = 's-minus'))
                        : n.SentimentScore.Positive > 0.65 &&
                          ((t.Sentiment = '+  '.concat(n.SentimentScore.Positive.toFixed(2))),
                          (t.SentimentClass = 's-plus')),
                      t.SentimentClass)
                    ) {
                      const e = document.getElementById('ttlist').tBodies[0].rows[a];
                      e &&
                        ((e.cells[2].className = t.SentimentClass),
                        (e.cells[2].innerText = t.Sentiment));
                    }
                  })(a, e, t, n);
                }),
                  a.detectKeyPhrases(n, (e, a) => {
                    !(function(e, t, a, n) {
                      e
                        ? console.error(e)
                        : Array.isArray(n.KeyPhrases) &&
                          n.KeyPhrases.forEach(e => {
                            if (e.Score > 0.75) {
                              const t = document.getElementById('ttlist').tBodies[0].rows[a];
                              t &&
                                (t.cells[4].innerHTML = t.cells[4].innerHTML.replace(
                                  e.Text,
                                  '<span class="hl">'.concat(e.Text, '</span>')
                                ));
                            }
                          });
                    })(e, 0, t, a);
                  });
              }
            });
          }),
          t
        );
      }
      function f(e) {
        e.sort(function(e, t) {
          return e.TransactionId < t.TransactionId
            ? -1
            : e.TransactionId > t.TransactionId
            ? 1
            : e.LoggedOn - t.LoggedOn;
        });
        const t = [];
        return (
          e.forEach(e => {
            t.length > 0 && t[t.length - 1].Speaker === e.Speaker
              ? (t[t.length - 1].Transcript += ' '.concat(e.Transcript))
              : t.push(Object(b.a)({}, e));
          }),
          t.forEach(e => {
            e.Transcript &&
              (-1 !== e.Transcript.search(/\baccount[a-z]* \b(num)[a-z]* \b[a-z]*/i) &&
                (e.Action = 'ClientSnapshot'),
              -1 !== e.Transcript.search(/\bmiss[a-z]* \b[a-z]*\b \b(connect|flight)[a-z]*/i) &&
                (e.Action = 'ConnectionDoctor'));
          }),
          t
        );
      }
      u.a.config.update({ region: S });
      a(710);
      const N = p.a.aws_project_region;
      u.a.config.update({ region: N });
      const y =
        '\nquery listTranscriptSegments($nextToken: String = "") {\n    listTranscriptSegments(nextToken: $nextToken) {\n        items {\n            TransactionId\n                StartTime\n                Speaker\n                EndTime\n                Transcript\n                LoggedOn\n        },\n        nextToken\n    }\n}\n';
      class C extends r.a.Component {
        constructor(e) {
          super(e), (this.state = { transcript: [] });
        }
        componentDidMount() {
          var e = this;
          return Object(v.a)(
            g.a.mark(function t() {
              var a, n, r, s;
              return g.a.wrap(function(t) {
                for (;;)
                  switch ((t.prev = t.next)) {
                    case 0:
                      return (t.next = 2), e.readTranscriptPaginationAndUpdate();
                    case 2:
                      return (
                        (a = t.sent),
                        e.setState({ transcript: a }),
                        (t.next = 6),
                        m.a.graphql(
                          Object(m.d)(
                            'subscription {\n    onAnnounceCreateTranscriptSegment {\n        TransactionId\n            StartTime\n            Speaker\n            EndTime\n            Transcript\n            LoggedOn\n    }\n}\n'
                          )
                        )
                      );
                    case 6:
                      (n = t.sent),
                        (r = t => {
                          e.setState(e => {
                            const a = e.transcript.slice();
                            return a.push(t), { transcript: a };
                          });
                        }),
                        (s = e => {
                          const t = e.value.data.onAnnounceCreateTranscriptSegment;
                          r(t);
                        }),
                        n.subscribe({ next: s, complete: console.log, error: console.error });
                    case 10:
                    case 'end':
                      return t.stop();
                  }
              }, t);
            })
          )();
        }
        readTranscriptPaginationAndUpdate() {
          return Object(v.a)(
            g.a.mark(function e() {
              var t, a, n, r;
              return g.a.wrap(function(e) {
                for (;;)
                  switch ((e.prev = e.next)) {
                    case 0:
                      return (t = []), (e.next = 3), m.a.graphql(Object(m.d)(y));
                    case 3:
                      (a = e.sent),
                        (n = a.data.listTranscriptSegments.nextToken),
                        (t = t.concat(a.data.listTranscriptSegments.items));
                    case 6:
                      if (null === n) {
                        e.next = 14;
                        break;
                      }
                      return (e.next = 9), m.a.graphql(Object(m.d)(y, { nextToken: n }));
                    case 9:
                      (r = e.sent),
                        (n = r.data.listTranscriptSegments.nextToken),
                        (t = t.concat(r.data.listTranscriptSegments.items)),
                        (e.next = 6);
                      break;
                    case 14:
                      return e.abrupt('return', t);
                    case 15:
                    case 'end':
                      return e.stop();
                  }
              }, e);
            })
          )();
        }
        shouldMergeTranscript() {
          return this.props.value === this.props.index;
        }
        render() {
          let e = [];
          if (this.shouldMergeTranscript()) {
            const t = this.state.transcript.reduce(
                (e, t) => (null !== e && e.LoggedOn > t.LoggedOn ? e : t),
                null
              ),
              a = null === t ? null : t.TransactionId;
            (e = [].concat(
              this.state.transcript.filter(e => e.TransactionId === a && null !== e.EndTime)
            )),
              (e = T(e).map((e, t) =>
                r.a.createElement(
                  'tr',
                  { key: t },
                  r.a.createElement('td', null, e.StartTime.toFixed(3)),
                  r.a.createElement(
                    'td',
                    null,
                    e.Speaker && 'spk_0' === e.Speaker ? 'agent' : 'caller'
                  ),
                  r.a.createElement(
                    'td',
                    { className: e.SentimentClass ? e.SentimentClass : 's-none' },
                    e.Sentiment ? e.Sentiment : ''
                  ),
                  r.a.createElement(
                    'td',
                    null,
                    e.Action && 'ClientSnapshot' === e.Action
                      ? r.a.createElement(
                          'a',
                          { href: '#modal2', className: 'action' },
                          'Client Snapshot'
                        )
                      : ''
                  ),
                  r.a.createElement('td', { className: 'transcript-note' }, e.Transcript)
                )
              ));
          }
          return r.a.createElement(
            'div',
            { className: 'AssistAgent', hidden: this.props.value !== this.props.index },
            r.a.createElement(
              'table',
              { id: 'ttlist', className: 'transcript' },
              r.a.createElement(
                'thead',
                { className: 'transcript' },
                r.a.createElement(
                  'tr',
                  null,
                  r.a.createElement('th', null, 'Start'),
                  r.a.createElement('th', null, 'Speaker'),
                  r.a.createElement('th', { style: { width: '3em' } }, '\xb1'),
                  r.a.createElement('th', null, 'Action'),
                  r.a.createElement(
                    'th',
                    { style: { width: '60%' } },
                    'Transcript',
                    r.a.createElement(
                      'a',
                      {
                        href: '#a',
                        onClick: e => {
                          this.setState({ transcript: [] }), e.preventDefault();
                        },
                        title: 'Clear transcript',
                      },
                      '\u2205'
                    )
                  )
                )
              ),
              r.a.createElement('tbody', null, e)
            ),
            r.a.createElement(
              'div',
              { id: 'modal1', className: 'overlay' },
              r.a.createElement(
                'a',
                { className: 'cancel', href: '#a', title: 'Close modal' },
                ' '
              ),
              r.a.createElement(
                'div',
                { className: 'modal' },
                r.a.createElement('h1', null, 'Connection Doctor'),
                r.a.createElement(
                  'div',
                  { className: 'content' },
                  r.a.createElement(
                    'table',
                    null,
                    r.a.createElement(
                      'tbody',
                      null,
                      r.a.createElement(
                        'tr',
                        null,
                        r.a.createElement('td', null, 'PNR: '),
                        r.a.createElement('td', null, 'CJK1Z3')
                      ),
                      r.a.createElement(
                        'tr',
                        null,
                        r.a.createElement('td', null, 'PAX: '),
                        r.a.createElement('td', null, 'Johnson/Jonas')
                      ),
                      r.a.createElement(
                        'tr',
                        null,
                        r.a.createElement('td', null, 'Itinerary: '),
                        r.a.createElement(
                          'td',
                          null,
                          'LGA/MIA NA 1211 1219/1531 (now 1600/1912)',
                          r.a.createElement('br', null),
                          'CONN 134 min (now *MISSED*)',
                          r.a.createElement('br', null),
                          'MIA/SJU NA 2561 1745/2026'
                        )
                      ),
                      r.a.createElement(
                        'tr',
                        null,
                        r.a.createElement('td', null, 'Remediation'),
                        r.a.createElement(
                          'td',
                          null,
                          r.a.createElement(
                            'span',
                            { className: 'opt', onClick: () => console.log('Internal') },
                            'Internal (0)'
                          ),
                          r.a.createElement(
                            'span',
                            { className: 'opt', onClick: () => console.log('Codeshare') },
                            'Codeshare (2)'
                          ),
                          r.a.createElement(
                            'span',
                            { className: 'opt', onClick: () => console.log('Other') },
                            'Other (10+)'
                          )
                        )
                      )
                    )
                  )
                )
              )
            ),
            r.a.createElement(
              'div',
              { id: 'modal2', className: 'overlay' },
              r.a.createElement(
                'a',
                { className: 'cancel', href: '#a', title: 'Close modal' },
                ' '
              ),
              r.a.createElement(
                'div',
                { className: 'modal' },
                r.a.createElement('h1', null, 'Client Snapshot'),
                r.a.createElement(
                  'div',
                  { className: 'content' },
                  r.a.createElement(
                    'table',
                    null,
                    r.a.createElement(
                      'tbody',
                      null,
                      r.a.createElement(
                        'tr',
                        null,
                        r.a.createElement('td', null, 'Account: '),
                        r.a.createElement('td', null, 'PC1234')
                      ),
                      r.a.createElement(
                        'tr',
                        null,
                        r.a.createElement('td', null, 'User: '),
                        r.a.createElement('td', null, 'joe@joey.com')
                      ),
                      r.a.createElement(
                        'tr',
                        null,
                        r.a.createElement('td', null, 'Software: '),
                        r.a.createElement(
                          'td',
                          null,
                          'PowerChart 1.35 (upgraded 12-Feb-2020 3:02 PM UTC)'
                        )
                      ),
                      r.a.createElement(
                        'tr',
                        null,
                        r.a.createElement('td', null, 'Remediation'),
                        r.a.createElement(
                          'td',
                          null,
                          r.a.createElement(
                            'span',
                            { className: 'opt', onClick: () => console.log('ReleaseNotes') },
                            'Release notes'
                          ),
                          r.a.createElement(
                            'span',
                            { className: 'opt', onClick: () => console.log('Manager') },
                            'Mgr. Escalation'
                          ),
                          r.a.createElement(
                            'span',
                            { className: 'opt', onClick: () => console.log('Credits') },
                            'Credits'
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          );
        }
      }
      var A = Object(i.a)(C, !1),
        I = a(763),
        w = a(765),
        _ = a(760),
        k = a(761),
        x = a(717),
        O = a(207),
        P = a.n(O),
        R = a(767),
        L = a(208),
        M = a.n(L),
        j = a(209),
        D = a.n(j),
        q = a(758),
        U = a(766),
        F = a(104),
        J = a.n(F),
        z = a(65),
        B = a(205);
      a(711);
      class K extends r.a.Component {
        constructor(e) {
          super(e),
            (this.onExpand = (e, t) => {
              !0 !== t ||
                (void 0 !== this.state.agentLegAudioUrl &&
                  void 0 !== this.state.callerLegAudioUrl) ||
                Object(z.c)(this.state.metadata.TransactionId).then(e => {
                  if (0 === e.length) return;
                  const t = e.map(e => {
                    if (void 0 !== e.Bucket && void 0 !== e.Key && void 0 !== e.Time)
                      return Object(z.a)(e.Bucket, e.Key);
                  });
                  if (
                    (Promise.all(t).then(e => {
                      this.setState({ callerLegAudioUrl: e[0], agentLegAudioUrl: e[1] });
                    }),
                    void 0 === this.state.mergedAudioUrl)
                  ) {
                    const t = e[0].Bucket,
                      a = e[0],
                      n = e[1];
                    Object(B.a)(t, a, n, this.state.metadata.TransactionId).then(e => {
                      this.setState({ mergedAudioUrl: e });
                    });
                  }
                });
            }),
            (this.onSwitchChange = e => {
              this.setState({ requireMerged: e.target.checked });
            }),
            (this.state = {
              metadata: this.props.metadata,
              transcript: [],
              requireMerged: !1,
              keyword: this.props.keyword,
            });
        }
        updateTranscript() {
          Object(z.d)(this.state.metadata.TransactionId).then(e => {
            this.setState({ transcript: f(e) });
          });
        }
        componentDidMount() {
          this.updateTranscript();
        }
        render() {
          return r.a.createElement(
            'div',
            { className: 'root' },
            r.a.createElement(
              w.a,
              { onChange: this.onExpand },
              r.a.createElement(
                _.a,
                {
                  expandIcon: r.a.createElement(P.a, null),
                  'aria-controls': 'panel1a-content',
                  id: 'panel1a-header',
                },
                r.a.createElement(
                  'div',
                  { className: 'avater-col' },
                  r.a.createElement(
                    R.a,
                    null,
                    'Inbound' === this.state.metadata.Direction
                      ? r.a.createElement(M.a, null)
                      : r.a.createElement(D.a, null)
                  )
                ),
                r.a.createElement(
                  'div',
                  { className: 'main-col' },
                  r.a.createElement(
                    'div',
                    { className: 'number-header-row' },
                    r.a.createElement(
                      x.a,
                      { className: 'number-header' },
                      'From: ',
                      this.state.metadata.SourcePhoneNumber
                    )
                  ),
                  r.a.createElement(
                    'div',
                    { className: 'sub-content-row' },
                    r.a.createElement(
                      x.a,
                      { className: 'sub-content' },
                      (() =>
                        void 0 === this.state.transcript
                          ? '(waiting for transcript retrivement...)'
                          : 0 === this.state.transcript.length
                          ? 'Cannot translate the streaming audio'
                          : this.state.transcript[0].Transcript + ' (click for more)')()
                    )
                  )
                ),
                r.a.createElement(
                  'div',
                  { className: 'right-col' },
                  (() =>
                    void 0 === this.state.metadata.EndTimeEpochSeconds
                      ? r.a.createElement(
                          'div',
                          null,
                          r.a.createElement(x.a, { className: 'third-heading' }, 'In Call')
                        )
                      : r.a.createElement(
                          'div',
                          null,
                          r.a.createElement(
                            'div',
                            null,
                            r.a.createElement(
                              x.a,
                              { className: 'third-heading' },
                              J.a.unix(this.state.metadata.StartTimeEpochSeconds).fromNow()
                            )
                          ),
                          r.a.createElement(
                            'div',
                            null,
                            r.a.createElement(
                              x.a,
                              { className: 'third-heading' },
                              (e => {
                                const t = J.a.duration(e, 'seconds');
                                let a = 'H[h] m[m] s[s]';
                                return (
                                  t.asSeconds() < 3600 && (a = 'm[m] s[s]'),
                                  J.a.utc(t.asMilliseconds()).format(a)
                                );
                              })(
                                this.state.metadata.EndTimeEpochSeconds -
                                  this.state.metadata.StartTimeEpochSeconds
                              )
                            )
                          )
                        ))()
                )
              ),
              r.a.createElement(
                k.a,
                null,
                r.a.createElement(
                  'div',
                  { className: 'panel-detail' },
                  (() =>
                    void 0 === this.state.transcript
                      ? r.a.createElement(x.a, null, ' (Retrieving transcripts ...) ')
                      : 0 === this.state.transcript.length
                      ? r.a.createElement(
                          'div',
                          { className: 'transcript' },
                          r.a.createElement(x.a, null, 'Transcript is not applicable')
                        )
                      : r.a.createElement(
                          'div',
                          { className: 'transcript' },
                          this.state.transcript.map(e =>
                            ((e, t, a) => {
                              const n = { backgroundColor: 'wheat' };
                              return r.a.createElement(
                                x.a,
                                null,
                                ' ',
                                'spk_0' === e ? 'Caller: ' : 'Agent: ',
                                t.split(' ').map(e =>
                                  !0 ===
                                  a
                                    .split(' ')
                                    .map(t => {
                                      if ('' === t) return !1;
                                      const a = new RegExp("[0-9a-zA-Z,?.' ]+", 'i').exec(t)[0];
                                      return !!new RegExp(a + '[,.?]?$', 'i').test(e);
                                    })
                                    .reduce((e, t) => e || t)
                                    ? r.a.createElement('span', { style: n }, e, ' ')
                                    : e + ' '
                                )
                              );
                            })(e.Speaker, e.Transcript, this.state.keyword)
                          )
                        ))(),
                  (() =>
                    r.a.createElement(
                      'div',
                      null,
                      r.a.createElement(q.a, {
                        control: r.a.createElement(U.a, {
                          size: 'small',
                          checked: this.state.requireMerged,
                          onChange: this.onSwitchChange,
                        }),
                        label: 'Merge audio?',
                      })
                    ))(),
                  (() =>
                    this.state.requireMerged
                      ? r.a.createElement(
                          'div',
                          { className: 'audio' },
                          r.a.createElement(
                            'div',
                            { className: 'merged-audio' },
                            r.a.createElement('p', null, 'Merged Audio'),
                            void 0 !== this.state.mergedAudioUrl
                              ? r.a.createElement('audio', {
                                  controls: !0,
                                  volume: '0.1',
                                  id: 'audio',
                                  className: 'stream-audio',
                                  src: this.state.mergedAudioUrl,
                                })
                              : r.a.createElement(
                                  x.a,
                                  null,
                                  ' Merged streaming audio is not applicable'
                                )
                          )
                        )
                      : r.a.createElement(
                          'div',
                          { className: 'audio' },
                          r.a.createElement(
                            'div',
                            { className: 'caller-leg' },
                            r.a.createElement('p', null, 'Caller leg'),
                            void 0 !== this.state.callerLegAudioUrl
                              ? r.a.createElement('audio', {
                                  controls: !0,
                                  volume: '0.1',
                                  id: 'audio',
                                  className: 'stream-audio',
                                  src: this.state.callerLegAudioUrl,
                                })
                              : r.a.createElement(
                                  x.a,
                                  null,
                                  ' Caller streaming audio is not applicable'
                                )
                          ),
                          r.a.createElement(
                            'div',
                            { className: 'agent-leg' },
                            r.a.createElement('p', null, 'Agent leg'),
                            void 0 !== this.state.agentLegAudioUrl
                              ? r.a.createElement('audio', {
                                  controls: !0,
                                  volume: '0.1',
                                  id: 'audio',
                                  className: 'stream-audio',
                                  src: this.state.agentLegAudioUrl,
                                })
                              : r.a.createElement(
                                  x.a,
                                  null,
                                  ' Agent streaming audio is not applicable'
                                )
                          )
                        ))()
                )
              )
            )
          );
        }
      }
      var V = K;
      a(714);
      class W extends r.a.Component {
        constructor(e) {
          super(e),
            (this.handleSearch = e => {
              this.setState({ currInput: e.target.value });
            }),
            (this.state = { metadata: [], currInput: '' });
        }
        componentDidMount() {
          Object(z.b)(this.props.accountId).then(e => {
            this.setState({ currInput: this.props.accountId, metadata: e });
          });
        }
        componentDidUpdate(e, t) {
          const a = this.state.currInput;
          this.state.currInput !== t.currInput &&
            Object(z.b)(this.state.currInput).then(e => {
              a === this.state.currInput &&
                (this.setState({ metadata: [] }), this.setState({ metadata: e }));
            });
        }
        render() {
          return r.a.createElement(
            'div',
            { className: 'HistorySearch', hidden: this.props.value !== this.props.index },
            r.a.createElement(
              'div',
              { className: 'search-text-field' },
              r.a.createElement(
                'form',
                { noValidate: !0, autoComlete: 'off' },
                r.a.createElement(I.a, {
                  variant: 'outlined',
                  label: 'Search',
                  id: 'searchField',
                  fullWidth: !0,
                  onChange: this.handleSearch,
                  helperText:
                    'Keyword includes metadata(account id, voice connector id, phone number, header, timestamp, etc) or Transcription',
                })
              )
            ),
            r.a.createElement(
              'div',
              null,
              this.state.metadata.map((e, t) =>
                r.a.createElement(V, { key: t, metadata: e, keyword: this.state.currInput })
              )
            )
          );
        }
      }
      var G = Object(i.a)(W, !1);
      m.c.configure(p.a);
      class H extends n.Component {
        constructor(e) {
          super(e),
            (this.handleChange = (e, t) => {
              this.setState({ value: t });
            }),
            (this.state = { value: '0', accountId: '' });
        }
        componentDidMount() {
          (document.title = 'Chime Vx - Agent Assist'),
            m.b
              .currentCredentials()
              .then(e =>
                new u.a.STS({ region: h, credentials: m.b.essentialCredentials(e) })
                  .getCallerIdentity({})
                  .promise()
              )
              .then(e => {
                this.setState({ accountId: e.Account });
              });
        }
        render() {
          return r.a.createElement(
            'div',
            { className: 'App' },
            r.a.createElement(
              'header',
              { className: 'App-header' },
              r.a.createElement('h1', { className: 'App-title' }, 'Agent Assist (Chime Vx)')
            ),
            r.a.createElement('br', null),
            r.a.createElement(
              l.a,
              {
                value: this.state.value,
                onChange: this.handleChange,
                indicatorColor: 'primary',
                textColor: 'primary',
                centered: !0,
              },
              r.a.createElement(o.a, { label: 'ActiveCall', value: '0' }),
              r.a.createElement(o.a, { label: 'Search', value: '1' })
            ),
            r.a.createElement(A, { value: this.state.value, index: '0' }),
            r.a.createElement(G, {
              accountId: this.state.accountId,
              value: this.state.value,
              index: '1',
            })
          );
        }
      }
      var $ = Object(i.a)(H, !0);
      Boolean(
        'localhost' === window.location.hostname ||
          '[::1]' === window.location.hostname ||
          window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
      );
      c.a.render(r.a.createElement($, null), document.getElementById('root')),
        'serviceWorker' in navigator &&
          navigator.serviceWorker.ready.then(e => {
            e.unregister();
          });
    },
  },
  [[222, 1, 2]],
]);
//# sourceMappingURL=main.229e82aa.chunk.js.map
