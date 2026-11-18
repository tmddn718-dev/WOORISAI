  persist() {
    if (!CFG.flow) return; // 설정이 없으면 원본과 똑같이(저장하지 않음) 동작
    const s = this.state;
    try { sessionStorage.setItem(SKEY, JSON.stringify({ mems: s.mems, plans: s.plans, invite: s.invite, friends: s.friends, spaces: s.spaces, devPics: s.devPics.filter(x => !/^blob:/.test(x)), threads: s.threads })); } catch (e) { /* 저장 공간이 모자라도 동작에는 문제 없음 */ }
  }
  goTab(t, top) { if (top && top.t === 'create') ev('create_abandon'); if (t === 'foot') ev('foot_view'); this.setState({ stack: [], tab: t, overlay: null }); }
  focusThreadInput() { setTimeout(() => { const el = document.querySelector('[data-thread-input]'); if (el) el.focus({ preventScroll: true }); }, 80); }
  openThread(photoId, focusComposer) {
    const id = String(photoId || '');
    if (!id) return;
    this.setState({ overlay: 'thread', threadPhotoId: id, threadReactionPhotoId: '', threadDraft: '', threadPhoto: '', threadParent: null, threadReplyName: '' }, () => { if (focusComposer) this.focusThreadInput(); });
  }
  threadReact(photoId, emoji) {
    const id = String(photoId || '');
    if (!id) return;
    this.setState(st => {
      const all = { ...(st.threads || {}) }, cur = { comments: [], reactions: {}, mine: '', ...(all[id] || {}) }, previous = cur.mine || '', reactions = { ...(cur.reactions || {}) };
      if (previous) reactions[previous] = Math.max(0, +(reactions[previous] || 0) - 1);
      if (previous === emoji) cur.mine = '';
      else { reactions[emoji] = +(reactions[emoji] || 0) + 1; cur.mine = emoji; }
      cur.reactions = reactions; all[id] = cur;
      return { threads: all, threadReactionPhotoId: '' };
    });
  }
  threadReply(id, name) { this.setState({ threadParent: id, threadReplyName: name }, () => this.focusThreadInput()); }
  threadDelete(id) {
    const photoId = this.state.threadPhotoId;
    if (!photoId) return;
    this.setState(st => {
      const all = { ...(st.threads || {}) }, cur = { comments: [], reactions: {}, mine: '', ...(all[photoId] || {}) }, target = cur.comments.find(c => c.id === id);
      if (!target || target.by !== ME) return null;
      cur.comments = cur.comments.filter(c => c.id !== id && c.parent !== id); all[photoId] = cur;
      return { threads: all, threadParent: st.threadParent === id ? null : st.threadParent, threadReplyName: st.threadParent === id ? '' : st.threadReplyName };
    }, () => this.say('댓글을 삭제했어요.'));
  }
  threadFile(e) {
    const f = e.target.files && e.target.files[0]; e.target.value = '';
    if (!f) return;
    shrink(f).then(photo => this.setState({ threadPhoto: photo }));
  }
  threadSubmit() {
    const s = this.state, text = String(s.threadDraft || '').trim();
    if (!text && !s.threadPhoto) { this.say('짧은 기억을 남겨 주세요.', 'warning'); return; }
    const photoId = String(s.threadPhotoId || '');
    if (!photoId) { this.say('사진을 다시 선택해 주세요.', 'warning'); return; }
    const row = { id: 'tc' + Date.now(), by: ME, at: '방금', text: text || '사진을 남겼어요.', photo: s.threadPhoto || '', parent: s.threadParent || null };
    this.setState(st => { const all = { ...(st.threads || {}) }, cur = { comments: [], reactions: {}, mine: '', ...(all[photoId] || {}) }; cur.comments = [...cur.comments, row]; all[photoId] = cur; return { threads: all, threadDraft: '', threadPhoto: '', threadParent: null, threadReplyName: '' }; }, () => this.say('댓글을 남겼어요.', 'success'));
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
