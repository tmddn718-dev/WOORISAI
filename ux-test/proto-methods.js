  persist() {
    if (!CFG.flow) return; // 설정이 없으면 원본과 똑같이(저장하지 않음) 동작
    const s = this.state;
    try { sessionStorage.setItem(SKEY, JSON.stringify({ mems: s.mems, plans: s.plans, invite: s.invite, friends: s.friends, spaces: s.spaces, devPics: s.devPics.filter(x => !/^blob:/.test(x)), threads: s.threads })); } catch (e) { /* 저장 공간이 모자라도 동작에는 문제 없음 */ }
  }
  goTab(t, top) { if (top && top.t === 'create') ev('create_abandon'); if (t === 'foot') ev('foot_view'); this.setState({ stack: [], tab: t, overlay: null }); }
  openThread(photoId) { this.setState({ overlay: 'thread', threadPhotoId: String(photoId), threadDraft: '', threadPhoto: '', threadParent: null }); }
  threadReact(emoji) {
    const id = this.state.threadPhotoId;
    this.setState(st => { const all = { ...(st.threads || {}) }, cur = { comments: [], reactions: {}, ...(all[id] || {}) }, mine = !!cur.reactions[emoji]; cur.reactions = { ...cur.reactions, [emoji]: mine ? 0 : 1 }; all[id] = cur; return { threads: all }; });
  }
  threadReply(id, name) { this.setState({ threadParent: id, threadReplyName: name }); }
  threadDelete(id) {
    const photoId = this.state.threadPhotoId;
    this.setState(st => { const all = { ...(st.threads || {}) }, cur = { comments: [], reactions: {}, ...(all[photoId] || {}) }; cur.comments = cur.comments.filter(c => c.id !== id && c.parent !== id); all[photoId] = cur; return { threads: all }; });
  }
  threadFile(e) {
    const f = e.target.files && e.target.files[0]; e.target.value = '';
    if (!f) return;
    shrink(f).then(photo => this.setState({ threadPhoto: photo }));
  }
  threadSubmit() {
    const s = this.state, text = String(s.threadDraft || '').trim();
    if (!text) { this.say('짧은 기억을 남겨 주세요.', 'warning'); return; }
    const photoId = s.threadPhotoId, row = { id: 'tc' + Date.now(), by: ME, at: '방금', text, photo: '', parent: s.threadParent || null };
    this.setState(st => { const all = { ...(st.threads || {}) }, cur = { comments: [], reactions: {}, ...(all[photoId] || {}) }; cur.comments = [...cur.comments, row]; all[photoId] = cur; return { threads: all, threadDraft: '', threadPhoto: '', threadParent: null, threadReplyName: '' }; });
  }
  // 친구 초대 시뮬레이션: 초대 링크를 복사하면 잠시 뒤 친구가 수락하고 사진 2장과 이야기를 더한다(서버 없음)
  simInvite(m) {
    const fr = this.state.friends, order = [...PEOPLE.filter(n => !fr.includes(n)), ...PEOPLE], cand = order.find(n => !m.w.includes(n));
    if (!cand) return;
    const t = setTimeout(() => {
      const base = m.w.length * 2, pics = [POOL[base % POOL.length], POOL[(base + 1) % POOL.length]];
      this.setState(st => ({
        friends: st.friends.includes(cand) ? st.friends : [...st.friends, cand],
        mems: st.mems.map(x => x.id !== m.id ? x : { ...x, w: [...x.w, cand], ph: x.ph + 2, st: x.st + 1, nw: cand + '님이 초대를 수락하고 사진 2장을 더했어요', contribs: [...x.contribs, { by: cand, at: '방금', ph: 2, st: 1, pics, text: SC_FRIEND_NOTE[cand] || '같이 기록하게 돼서 좋아요.' }] })
      }));
      this.say(cand + '님이 초대를 수락했어요(데모). 사진 2장과 이야기를 더했어요.', 'success');
      ev('invite_complete', { friends: new Set([...this.state.friends, cand]).size });
    }, 2400);
    (this._sim = this._sim || []).push(t);
  }
  // 약속 참석 응답 시뮬레이션: 초대한 친구들이 차례로 답한다
  simPlan(id, names) {
    const ans = ['yes', 'maybe', 'yes', 'no', 'yes', 'maybe'], ko = { yes: '참석', maybe: '미정', no: '불참' };
    names.forEach((n, i) => {
      const t = setTimeout(() => {
        this.setState(st => ({ plans: st.plans.map(p => p.id === id ? { ...p, inv: { ...p.inv, [n]: ans[i % ans.length] } } : p) }));
        if (i === 0) this.say(n + '님이 ' + ko[ans[0]] + '으로 답했어요(데모).');
      }, 2200 + i * 1400);
      (this._sim = this._sim || []).push(t);
    });
  }
