import { useState } from 'react'
import { getStegColor, getStegLabel } from '../data.js'
import { Badge, Avatar, Card, EmptyState, LogEntry, CheckItem, SectionTitle } from './UI.jsx'
import styles from './ElevhalsaView.module.css'

const LOG_TYPES = ['Notering', 'Kontakt', 'Möte', 'Kartläggning', 'Utredning']

const STEG3_ITEMS = [
  { key: 'u1', label: 'Ärendet överlämnat från mentor – rektors beslut bekräftat' },
  { key: 'u2', label: 'Fördjupad utredning påbörjad (intervju med elev, vårdnadshavare och personal)' },
  { key: 'u3', label: 'Tvärprofessionell analys genomförd' },
  { key: 'u4', label: 'Samverkan med externa aktörer vid behov (BUP, Socialtjänsten, Familjens hus)' },
  { key: 'u5', label: 'Samråds-/nätverksmöte genomfört – insatser planerade' },
]

export default function ElevhalsaView({ students, addLog, toggleSteg3Check }) {
  const [activeTab, setActiveTab] = useState('ärenden')
  const [selectedId, setSelectedId] = useState(null)
  const [logText, setLogText] = useState('')
  const [logType, setLogType] = useState('Utredning')

  const activeArenden = students.filter(s => s.steg >= 2)
  const kritiska = students.filter(s => s.steg === 3)
  const selected = students.find(s => s.id === selectedId)

  function handleAddLog() {
    if (!logText.trim() || !selectedId) return
    addLog(selectedId, logType, logText)
    setLogText('')
  }

  return (
    <div>
      <div className={styles.tabs}>
        {['ärenden', 'utredningar', 'dokumentation'].map(t => (
          <button key={t} className={`${styles.tab} ${activeTab === t ? styles.active : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'ärenden' ? `Ärenden (${activeArenden.length})` : t === 'utredningar' ? `Fördjupade utredningar (${kritiska.length})` : 'Dokumentation'}
          </button>
        ))}
      </div>

      {activeTab === 'ärenden' && (
        <div>
          {activeArenden.length === 0
            ? <EmptyState text="Inga aktiva ärenden just nu." />
            : activeArenden.map(s => (
              <Card key={s.id} className={styles.arendeCard}>
                <div className={styles.arendeRow}>
                  <Avatar name={s.name} color={getStegColor(s.steg)} />
                  <div className={styles.arendeInfo}>
                    <div className={styles.arendeName}>{s.name}</div>
                    <div className={styles.arendeMeta}>
                      {s.klass}
                      {s.mentor ? ` · Mentor: ${s.mentor}` : ''}
                      {' · '}
                      {s.dagarIFoljd} dagar i följd · {s.separataTillfallen} tillfällen · {s.totalProcent}% totalt
                    </div>
                  </div>
                  <Badge color={getStegColor(s.steg)}>{getStegLabel(s.steg)}</Badge>
                </div>

                {s.steg >= 2 && (
                  <div className={styles.steg2Status}>
                    <div className={styles.steg2Title}>Mentor – steg 2 status</div>
                    {[
                      { key: 'k1', label: 'Enskilt samtal med eleven' },
                      { key: 'k2', label: 'Hemmet kontaktat och dokumenterat i Prorenata' },
                      { key: 'k3', label: 'Fysiskt möte bokat med elev och vårdnadshavare' },
                      { key: 'k4', label: 'Mötet genomfört och dokumenterat i Prorenata' },
                      { key: 'k5', label: 'Uppföljning inplanerad (2–3 veckor)' },
                    ].map(item => (
                      <div key={item.key} className={styles.statusRow}>
                        <span className={`${styles.statusDot} ${s.steg2Checks[item.key] ? styles.done : styles.notDone}`} />
                        <span className={styles.statusText}>{item.label}</span>
                        {s.steg2Checks[item.key] && <span className={styles.statusOk}>klar</span>}
                      </div>
                    ))}
                  </div>
                )}

                {s.steg === 3 && (
                  <div className={styles.steg3Badge}>
                    🔴 Rektor har beslutat om steg 3 – fördjupad utredning pågår
                  </div>
                )}
              </Card>
            ))
          }
        </div>
      )}

      {activeTab === 'utredningar' && (
        <div>
          {kritiska.length === 0
            ? <EmptyState text="Inga fördjupade utredningar aktiva." />
            : kritiska.map(s => (
              <Card key={s.id} className={styles.utredCard}>
                <div className={styles.utredHeader}>
                  <Avatar name={s.name} color="danger" size="lg" />
                  <div>
                    <div className={styles.utredName}>{s.name}</div>
                    <div className={styles.utredMeta}>
                      {s.klass}
                      {s.mentor ? ` · Mentor: ${s.mentor}` : ''}
                      {' · '}
                      <Badge color="danger">Problematisk frånvaro</Badge>
                    </div>
                  </div>
                </div>

                <div className={styles.actorsBox}>
                  <div className={styles.actorsTitle}>Möjliga samverkansaktörer</div>
                  <div className={styles.actorsList}>
                    {['BUP', 'Socialtjänsten', 'Familjens hus'].map(a => (
                      <span key={a} className={styles.actorChip}>{a}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.checklistSection}>
                  <div className={styles.checklistTitle}>Utredningschecklista</div>
                  {STEG3_ITEMS.map(item => (
                    <CheckItem key={item.key} checked={s.steg3Checks[item.key]} onClick={() => toggleSteg3Check(s.id, item.key)}>
                      {item.label}
                    </CheckItem>
                  ))}
                </div>

                <div className={styles.progress}>
                  {Object.values(s.steg3Checks).filter(Boolean).length} av {STEG3_ITEMS.length} steg klara
                </div>
              </Card>
            ))
          }
        </div>
      )}

      {activeTab === 'dokumentation' && (
        <div>
          <div className={styles.studentPicker}>
            <span className={styles.pickerLabel}>Välj elev:</span>
            <div className={styles.pickerList}>
              {activeArenden.map(s => (
                <button key={s.id} className={`${styles.pickerBtn} ${selectedId === s.id ? styles.pickerActive : ''}`} onClick={() => setSelectedId(s.id)}>
                  <Avatar name={s.name} color={getStegColor(s.steg)} size="sm" />
                  <span>{s.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {!selected && <EmptyState text="Välj ett ärende ovan." />}
          {selected && (
            <Card>
              <div className={styles.docHeader}>
                <Avatar name={selected.name} color={getStegColor(selected.steg)} />
                <div>
                  <div className={styles.docName}>{selected.name}</div>
                  <div className={styles.docKlass}>
                    {selected.klass}{selected.mentor ? ` · Mentor: ${selected.mentor}` : ''}
                  </div>
                </div>
              </div>

              <div className={styles.prorenataNote}>
                📋 <strong>Kom ihåg:</strong> Dokumentera även i <strong>Prorenata</strong>.
              </div>

              <div className={styles.logForm}>
                <select value={logType} onChange={e => setLogType(e.target.value)} className={styles.logSelect}>
                  {LOG_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <input
                  className={styles.logInput}
                  placeholder="Skriv anteckning..."
                  value={logText}
                  onChange={e => setLogText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddLog()}
                />
                <button className={styles.logBtn} onClick={handleAddLog}>Spara</button>
              </div>
              <div>
                {selected.logs.length === 0
                  ? <EmptyState text="Inga loggposter ännu." />
                  : selected.logs.map(l => <LogEntry key={l.id} entry={l} />)
                }
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
