import * as React from 'react'
import * as T from '@/constants/types'
import * as C from '@/constants'
import * as Kb from '@/common-adapters'
import UserNotice from '../user-notice'

type Props = {
  message: T.Chat.MessageSystemGitPush
  you?: string
  onClickCommit: (commitHash: string) => void
  onClickUserAvatar: (username: string) => void
  onViewGitRepo: (repoID: string, teamname: string) => void
}

type CreateProps = {
  pusher: string
  repo: string
  repoID: string
  team: string
  onViewGitRepo: Props['onViewGitRepo']
  you: Props['you']
}
const GitPushCreate = (props: CreateProps) => {
  const {you, pusher, repo, repoID, team, onViewGitRepo} = props
  return (
    <Kb.Text type="BodySmall">
      {pusher === you ? 'You ' : ''}created a new team repository called{` `}
      <Kb.Text type="BodySmallPrimaryLink" onClick={repoID ? () => onViewGitRepo(repoID, team) : undefined}>
        {repo}
      </Kb.Text>
      .
    </Kb.Text>
  )
}

type PushDefaultProps = {
  pusher: string
  commitRef: T.RPCGen.GitRefMetadata
  repo: string
  repoID: string
  team: string
  branchName: string
  onViewGitRepo: Props['onViewGitRepo']
  onClickCommit: Props['onClickCommit']
  you: Props['you']
}
const GitPushDefault = (props: PushDefaultProps) => {
  const {pusher, you, commitRef, repo, repoID, team, branchName, onViewGitRepo, onClickCommit} = props
  return (
    <Kb.Box2 direction="vertical" gap="xtiny" alignSelf="flex-start">
      <Kb.Text type="BodySmall">
        {pusher === you ? 'You ' : ''}pushed {!!commitRef.commits && commitRef.commits.length}{' '}
        {`commit${!!commitRef.commits && commitRef.commits.length !== 1 ? 's' : ''}`} to
        <Kb.Text
          type="BodySmall"
          style={repoID ? styles.repoText : undefined}
          onClick={repoID ? () => onViewGitRepo(repoID, team) : undefined}
        >{` ${repo}/${branchName}`}</Kb.Text>
        :
      </Kb.Text>
      <Kb.Box2 direction="vertical" alignSelf="flex-start">
        {(commitRef.commits || []).map((commit, i) => (
          <Kb.Box2 direction="horizontal" key={commit.commitHash} alignSelf="flex-start">
            <Kb.TimelineMarker
              idx={i}
              max={commitRef.commits ? commitRef.commits.length - 1 : 0}
              style={styles.marker}
            />
            <Kb.Box2 direction="horizontal" alignItems="flex-start" style={styles.hashAndMessage}>
              <Kb.Box2 direction="vertical" style={styles.dot}>
                <Kb.Text
                  type="Terminal"
                  style={styles.commitHash}
                  onClick={() => onClickCommit(commit.commitHash)}
                >
                  {commit.commitHash.substring(0, 8)}
                </Kb.Text>
              </Kb.Box2>
              <Kb.Box2 direction="vertical">
                <Kb.Text type="BodySmall" selectable={true} style={styles.commitMessage} lineClamp={1}>
                  {commit.message}
                </Kb.Text>
              </Kb.Box2>
            </Kb.Box2>
          </Kb.Box2>
        ))}
      </Kb.Box2>
    </Kb.Box2>
  )
}

type PushCommonProps = {
  children: React.ReactNode
}

const GitPushCommon = ({children}: PushCommonProps) => <UserNotice>{children}</UserNotice>

const GitPush = React.memo(function GitPush(p: Props) {
  const {repo, repoID, refs, pushType, pusher, team} = p.message
  const gitType = T.RPCGen.GitPushType[pushType]

  switch (gitType) {
    case 'default':
      return (
        <>
          {refs.map(ref => {
            const branchName = C.Chat.systemGitBranchName(ref)
            return (
              <GitPushCommon key={branchName}>
                <GitPushDefault
                  commitRef={ref}
                  branchName={branchName}
                  pusher={pusher}
                  repo={repo}
                  repoID={repoID}
                  team={team}
                  onViewGitRepo={p.onViewGitRepo}
                  onClickCommit={p.onClickCommit}
                  you={p.you}
                />
              </GitPushCommon>
            )
          })}
        </>
      )
    case 'createrepo':
      return (
        <GitPushCommon>
          <GitPushCreate
            pusher={pusher}
            repo={repo}
            repoID={repoID}
            team={team}
            onViewGitRepo={p.onViewGitRepo}
            you={p.you}
          />
        </GitPushCommon>
      )
    // FIXME: @Jacob - The service has not implemented 'renamerepo' yet, so we don't render anything
    default:
      return null
  }
})

const styles = Kb.Styles.styleSheetCreate(
  () =>
    ({
      commitHash: Kb.Styles.platformStyles({
        common: {
          color: Kb.Styles.globalColors.blueDarkOrBlueLight,
          fontSize: 12,
          lineHeight: 16,
        },
      }),
      commitMessage: {
        height: '100%',
        textAlign: 'left',
      },
      dot: {
        backgroundColor: Kb.Styles.globalColors.blueLighter_20,
        borderRadius: 3,
        height: '100%',
        marginBottom: 1,
        marginRight: Kb.Styles.globalMargins.xtiny,
        padding: 2,
      },
      hashAndMessage: {
        height: 18,
        marginBottom: Kb.Styles.globalMargins.xtiny,
        marginTop: Kb.Styles.globalMargins.xtiny,
      },
      marker: {
        flexShrink: 0,
        marginRight: Kb.Styles.globalMargins.xtiny,
        ...(Kb.Styles.isMobile ? {marginTop: -3} : null),
        minWidth: 0,
      },
      repoText: {color: Kb.Styles.globalColors.black_50},
    }) as const
)

export default GitPush
