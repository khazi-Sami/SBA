"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateQurbaniTotal,
  isValidIndianPhoneNumber,
  isValidQurbaniAddress,
  isValidQurbaniName,
  normalizeIndianPhoneNumber,
  qurbaniMeatOptions,
  qurbaniPaymentOptions,
  qurbaniShareOptions,
  QURBANI_SHARE_COST,
} from "@/lib/qurbani";

type Submission = {
  id: string;
  participantName: string;
  fatherName: string;
  niyyahName: string;
  contactNumber: string;
  addressLocation: string;
  shares: number;
  totalAmount: number;
  paymentStatus: "PAID" | "PENDING";
  meatPreference: "RECEIVE_MEAT" | "DONATE";
  createdAt: string;
};

type Summary = {
  totalParticipants: number;
  totalShares: number;
  totalExpectedAmount: number;
};

const rowOrderStorageKey = "qurbani-admin-row-order-v1";

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function QurbaniAdminClient() {
  const [accessKey, setAccessKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [draggedSubmissionId, setDraggedSubmissionId] = useState<string | null>(null);
  const [swapFrom, setSwapFrom] = useState("");
  const [swapTo, setSwapTo] = useState("");
  const [groupSwapFrom, setGroupSwapFrom] = useState("");
  const [groupSwapTo, setGroupSwapTo] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<number[]>([]);
  const [participantName, setParticipantName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [niyyahName, setNiyyahName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [addressLocation, setAddressLocation] = useState("");
  const [shares, setShares] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [paymentStatus, setPaymentStatus] = useState<Submission["paymentStatus"]>("PENDING");
  const [meatPreference, setMeatPreference] = useState<Submission["meatPreference"]>("RECEIVE_MEAT");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    participantName: "",
    fatherName: "",
    niyyahName: "",
    contactNumber: "",
    addressLocation: "",
    paymentStatus: "PENDING" as Submission["paymentStatus"],
    meatPreference: "RECEIVE_MEAT" as Submission["meatPreference"],
  });

  useEffect(() => {
    if (!summary || typeof window === "undefined") {
      return;
    }

    const orderedIds = submissions.map((submission) => submission.id);
    window.localStorage.setItem(rowOrderStorageKey, JSON.stringify(orderedIds));
  }, [summary, submissions]);

  function applySavedRowOrder(incomingSubmissions: Submission[]) {
    if (typeof window === "undefined") {
      return incomingSubmissions;
    }

    try {
      const raw = window.localStorage.getItem(rowOrderStorageKey);
      if (!raw) {
        return incomingSubmissions;
      }

      const orderedIds = JSON.parse(raw) as string[];
      const byId = new Map(incomingSubmissions.map((submission) => [submission.id, submission]));
      const orderedSubmissions = orderedIds
        .map((id) => byId.get(id))
        .filter((submission): submission is Submission => Boolean(submission));
      const remainingSubmissions = incomingSubmissions.filter(
        (submission) => !orderedIds.includes(submission.id)
      );

      return [...orderedSubmissions, ...remainingSubmissions];
    } catch {
      return incomingSubmissions;
    }
  }

  const adminFormTotal = useMemo(() => calculateQurbaniTotal(shares), [shares]);

  function resetAdminForm() {
    setParticipantName("");
    setFatherName("");
    setNiyyahName("");
    setContactNumber("");
    setAddressLocation("");
    setShares(1);
    setPaymentStatus("PENDING");
    setMeatPreference("RECEIVE_MEAT");
  }

  function startEdit(submission: Submission) {
    setEditingId(submission.id);
    setEditError(null);
    setEditForm({
      participantName: submission.participantName,
      fatherName: submission.fatherName,
      niyyahName: submission.niyyahName,
      contactNumber: submission.contactNumber,
      addressLocation: submission.addressLocation,
      paymentStatus: submission.paymentStatus,
      meatPreference: submission.meatPreference,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
    setEditSaving(false);
  }

  async function handleDelete(submission: Submission) {
    const confirmed = window.confirm(
      `Delete the Qurbani row for ${submission.participantName}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(submission.id);
    setError(null);

    try {
      const res = await fetch("/api/qurbani", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: submission.id }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? "Unable to delete entry");
      }

      if (editingId === submission.id) {
        cancelEdit();
      }

      await fetchAdminData(accessKey);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete entry");
    } finally {
      setDeletingId(null);
    }
  }

  async function fetchAdminData(currentKey: string) {
    const res = await fetch(`/api/qurbani/admin?key=${encodeURIComponent(currentKey)}`, {
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error ?? "Unable to load admin data");
    }

    setSummary(data.summary as Summary);
    setSubmissions(applySavedRowOrder((data.submissions ?? []) as Submission[]));
    setSwapFrom("");
    setSwapTo("");
    setGroupSwapFrom("");
    setGroupSwapTo("");
  }

  function buildCsv() {
    const headers = [
      "Participant Name",
      "Father Name",
      "Niyyah Name",
      "Contact Number",
      "Address / Location",
      "Shares",
      "Total Amount",
      "Payment Status",
      "Meat Preference",
      "Timestamp",
    ];

    const rows = submissions.map((submission) => [
      submission.participantName,
      submission.fatherName,
      submission.niyyahName,
      submission.contactNumber,
      submission.addressLocation,
      String(submission.shares),
      String(submission.totalAmount),
      submission.paymentStatus === "PAID" ? "Paid" : "Pending",
      submission.meatPreference === "DONATE" ? "Donate (Khairat)" : "Receive meat",
      new Date(submission.createdAt).toLocaleString(),
    ]);

    return [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
  }

  function downloadCsv() {
    if (!submissions.length) return;

    const blob = new Blob([buildCsv()], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qurbani-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function shareCsv() {
    if (!submissions.length) return;

    const csv = buildCsv();
    const file = new File([csv], `qurbani-submissions-${new Date().toISOString().slice(0, 10)}.csv`, {
      type: "text/csv",
    });

    if (
      typeof navigator !== "undefined" &&
      "share" in navigator &&
      "canShare" in navigator &&
      navigator.canShare?.({ files: [file] })
    ) {
      await navigator.share({
        title: "Qurbani Submissions",
        text: "Qurbani submission export",
        files: [file],
      });
      return;
    }

    downloadCsv();
  }

  async function shareSummaryOnWhatsApp() {
    if (!summary) return;

    const message = [
      "Qurbani Registration Summary",
      `Total Participants: ${summary.totalParticipants}`,
      `Total Shares: ${summary.totalShares}`,
      `Total Expected Amount: ${formatINR(summary.totalExpectedAmount)}`,
      "",
      "Use the CSV export to share the full submission table.",
    ].join("\n");

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  function moveSubmission(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setSubmissions((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  function toggleGroupCollapse(groupIndex: number) {
    setCollapsedGroups((current) =>
      current.includes(groupIndex)
        ? current.filter((item) => item !== groupIndex)
        : [...current, groupIndex]
    );
  }

  function swapGroupsByNumbers(e: React.FormEvent) {
    e.preventDefault();
    const fromGroupIndex = Number(groupSwapFrom) - 1;
    const toGroupIndex = Number(groupSwapTo) - 1;

    if (
      Number.isNaN(fromGroupIndex) ||
      Number.isNaN(toGroupIndex) ||
      fromGroupIndex < 0 ||
      toGroupIndex < 0 ||
      fromGroupIndex >= groupedSubmissions.length ||
      toGroupIndex >= groupedSubmissions.length
    ) {
      setError("Enter valid group numbers to swap.");
      return;
    }

    if (fromGroupIndex === toGroupIndex) {
      setError("Choose two different groups to swap.");
      return;
    }

    setError(null);
    setSubmissions((current) => {
      const groups: Submission[][] = [];
      for (let index = 0; index < current.length; index += 7) {
        groups.push(current.slice(index, index + 7));
      }

      [groups[fromGroupIndex], groups[toGroupIndex]] = [groups[toGroupIndex], groups[fromGroupIndex]];
      return groups.flat();
    });
  }

  function swapSubmissionsByRowNumbers(e: React.FormEvent) {
    e.preventDefault();
    const from = Number(swapFrom) - 1;
    const to = Number(swapTo) - 1;

    if (
      Number.isNaN(from) ||
      Number.isNaN(to) ||
      from < 0 ||
      to < 0 ||
      from >= submissions.length ||
      to >= submissions.length
    ) {
      setError("Enter valid row numbers to swap.");
      return;
    }

    setError(null);
    setSubmissions((current) => {
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  }

  const groupedSubmissions = useMemo(() => {
    const groups: Submission[][] = [];
    for (let index = 0; index < submissions.length; index += 7) {
      groups.push(submissions.slice(index, index + 7));
    }
    return groups;
  }, [submissions]);

  const fullyGroupedCows = useMemo(
    () => groupedSubmissions.filter((group) => group.length === 7).length,
    [groupedSubmissions]
  );

  async function loadAdminData(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await fetchAdminData(accessKey);
      setGroupSwapFrom("");
      setGroupSwapTo("");
    } catch (loadError) {
      setSummary(null);
      setSubmissions([]);
      setError(loadError instanceof Error ? loadError.message : "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!summary) {
      setCreateError("Load admin data first.");
      return;
    }

    const normalizedContactNumber = normalizeIndianPhoneNumber(contactNumber);

    if (!isValidQurbaniName(participantName)) {
      setCreateError("Participant name should be 2-80 letters and may include spaces, dots, apostrophes, or hyphens");
      return;
    }

    if (!isValidQurbaniName(fatherName)) {
      setCreateError("Father name should be 2-80 letters and may include spaces, dots, apostrophes, or hyphens");
      return;
    }

    if (!isValidQurbaniName(niyyahName)) {
      setCreateError("Niyyah name should be 2-80 letters and may include spaces, dots, apostrophes, or hyphens");
      return;
    }

    if (!isValidIndianPhoneNumber(normalizedContactNumber)) {
      setCreateError("Enter a valid Indian mobile number starting with 6, 7, 8, or 9");
      return;
    }

    if (!isValidQurbaniAddress(addressLocation)) {
      setCreateError("Address / location should be at least 10 characters with enough detail for coordination");
      return;
    }

    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const res = await fetch("/api/qurbani", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantName,
          fatherName,
          niyyahName,
          contactNumber: normalizedContactNumber,
          addressLocation,
          shares,
          paymentStatus,
          meatPreference,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? "Unable to add Qurbani entry");
      }

      resetAdminForm();
      setCreateSuccess(
        data?.count && data.count > 1
          ? `${data.count} share rows added successfully.`
          : "New Qurbani entry added successfully."
      );
      await fetchAdminData(accessKey);
    } catch (submissionError) {
      setCreateError(
        submissionError instanceof Error ? submissionError.message : "Unable to add Qurbani entry"
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;

    const normalizedContactNumber = normalizeIndianPhoneNumber(editForm.contactNumber);

    if (!isValidQurbaniName(editForm.participantName)) {
      setEditError("Participant name should be 2-80 letters and may include spaces, dots, apostrophes, or hyphens");
      return;
    }

    if (!isValidQurbaniName(editForm.fatherName)) {
      setEditError("Father name should be 2-80 letters and may include spaces, dots, apostrophes, or hyphens");
      return;
    }

    if (!isValidQurbaniName(editForm.niyyahName)) {
      setEditError("Niyyah name should be 2-80 letters and may include spaces, dots, apostrophes, or hyphens");
      return;
    }

    if (!isValidIndianPhoneNumber(normalizedContactNumber)) {
      setEditError("Enter a valid Indian mobile number starting with 6, 7, 8, or 9");
      return;
    }

    if (!isValidQurbaniAddress(editForm.addressLocation)) {
      setEditError("Address / location should be at least 10 characters with enough detail for coordination");
      return;
    }

    setEditSaving(true);
    setEditError(null);

    try {
      const res = await fetch("/api/qurbani", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          participantName: editForm.participantName,
          fatherName: editForm.fatherName,
          niyyahName: editForm.niyyahName,
          contactNumber: normalizedContactNumber,
          addressLocation: editForm.addressLocation,
          paymentStatus: editForm.paymentStatus,
          meatPreference: editForm.meatPreference,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? "Unable to update entry");
      }

      await fetchAdminData(accessKey);
      cancelEdit();
    } catch (saveError) {
      setEditError(saveError instanceof Error ? saveError.message : "Unable to update entry");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDeleteGroup(group: Submission[], groupNumber: number) {
    const confirmed = window.confirm(
      `Delete all rows in Group ${groupNumber}? This will remove ${group.length} row${group.length > 1 ? "s" : ""}.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(`group-${groupNumber}`);
    setError(null);

    try {
      await Promise.all(
        group.map((submission) =>
          fetch("/api/qurbani", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: submission.id }),
          }).then(async (res) => {
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              throw new Error(data?.error ?? "Unable to delete group");
            }
          })
        )
      );

      if (editingId && group.some((submission) => submission.id === editingId)) {
        cancelEdit();
      }

      await fetchAdminData(accessKey);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete group");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main style={pageStyle}>
      <section style={shellStyle}>
        <div style={heroStyle}>
          <div style={eyebrowStyle}>Qurbani Admin</div>
          <h1 style={titleStyle}>Review submissions and totals</h1>
          <p style={subtitleStyle}>
            Use the admin access key to view participants, shares, total expected amount,
            and the full Qurbani registration list.
          </p>
        </div>

        <section style={panelStyle}>
          <form onSubmit={loadAdminData} style={accessFormStyle}>
            <div style={{ flex: "1 1 320px" }}>
              <label style={labelStyle}>Admin Access Key</label>
              <input
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                type="password"
                placeholder="Enter admin access key"
                style={inputStyle}
                required
              />
            </div>
            <button type="submit" disabled={loading} style={primaryButtonStyle}>
              {loading ? "Loading..." : "View Submissions"}
            </button>
          </form>

          {error ? <div style={{ ...errorStyle, marginTop: 18 }}>{error}</div> : null}
        </section>

        {summary ? (
          <>
            <section style={panelStyle}>
              <div style={tableHeaderStyle}>
                <div>
                  <div style={eyebrowStyle}>Add New</div>
                  <h2 style={sectionTitleStyle}>Create a Qurbani entry from admin</h2>
                </div>
                <div style={helperChipStyle}>Useful for walk-ins, calls, or offline payments</div>
              </div>

              <form onSubmit={handleAdminCreate} style={adminFormGridStyle}>
                <label style={fieldBlockStyle}>
                  <span style={fieldLabelStyle}>Share lenay walay ka naam</span>
                  <span style={fieldHintStyle}>Participant&apos;s Name</span>
                  <input
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Participant name"
                    style={inputStyle}
                    minLength={2}
                    maxLength={80}
                    required
                  />
                </label>

                <label style={fieldBlockStyle}>
                  <span style={fieldLabelStyle}>Walid ka naam</span>
                  <span style={fieldHintStyle}>Father&apos;s Name</span>
                  <input
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="Father name"
                    style={inputStyle}
                    minLength={2}
                    maxLength={80}
                    required
                  />
                </label>

                <label style={fieldBlockStyle}>
                  <span style={fieldLabelStyle}>Kiske naam pe Qurbani ho rahi hai</span>
                  <span style={fieldHintStyle}>Name for Niyyah</span>
                  <input
                    value={niyyahName}
                    onChange={(e) => setNiyyahName(e.target.value)}
                    placeholder="Niyyah name"
                    style={inputStyle}
                    minLength={2}
                    maxLength={80}
                    required
                  />
                </label>

                <label style={fieldBlockStyle}>
                  <span style={fieldLabelStyle}>Rabta number / WhatsApp</span>
                  <span style={fieldHintStyle}>Contact Number</span>
                  <input
                    value={contactNumber}
                    onChange={(e) => setContactNumber(normalizeIndianPhoneNumber(e.target.value))}
                    placeholder="+91 9876543210"
                    style={inputStyle}
                    inputMode="tel"
                    maxLength={13}
                    required
                  />
                </label>

                <label style={{ ...fieldBlockStyle, gridColumn: "1 / -1" }}>
                  <span style={fieldLabelStyle}>Pata / Location</span>
                  <span style={fieldHintStyle}>Address / Location</span>
                  <textarea
                    value={addressLocation}
                    onChange={(e) => setAddressLocation(e.target.value)}
                    placeholder="House / street / area / landmark / city"
                    style={{ ...inputStyle, minHeight: 96, resize: "vertical" }}
                    minLength={10}
                    maxLength={240}
                    required
                  />
                </label>

                <label style={fieldBlockStyle}>
                  <span style={fieldLabelStyle}>Kitne hissay chahiye?</span>
                  <span style={fieldHintStyle}>Number of Shares</span>
                  <select
                    value={shares}
                    onChange={(e) => setShares(Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 | 7)}
                    style={inputStyle}
                    required
                  >
                    {qurbaniShareOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <div style={fieldBlockStyle}>
                  <span style={fieldLabelStyle}>Per hissa cost (fixed)</span>
                  <span style={fieldHintStyle}>Cost per Share</span>
                  <div style={readonlyValueStyle}>{formatINR(QURBANI_SHARE_COST)} per share</div>
                </div>

                <label style={fieldBlockStyle}>
                  <span style={fieldLabelStyle}>Paisa ada ho gaya?</span>
                  <span style={fieldHintStyle}>Payment Status</span>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as Submission["paymentStatus"])}
                    style={inputStyle}
                    required
                  >
                    {qurbaniPaymentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={fieldBlockStyle}>
                  <span style={fieldLabelStyle}>Gosht preference</span>
                  <span style={fieldHintStyle}>Meat Preference</span>
                  <select
                    value={meatPreference}
                    onChange={(e) => setMeatPreference(e.target.value as Submission["meatPreference"])}
                    style={inputStyle}
                    required
                  >
                    {qurbaniMeatOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div style={{ ...fieldBlockStyle, gridColumn: "1 / -1" }}>
                  <span style={fieldLabelStyle}>Auto calculated total</span>
                  <span style={fieldHintStyle}>
                    {shares} share{shares > 1 ? "s" : ""} × {formatINR(QURBANI_SHARE_COST)}
                  </span>
                  <div style={adminTotalCardStyle}>{formatINR(adminFormTotal)}</div>
                </div>

                {createError ? <div style={{ ...errorStyle, gridColumn: "1 / -1" }}>{createError}</div> : null}
                {createSuccess ? (
                  <div style={{ ...successStyle, gridColumn: "1 / -1" }}>{createSuccess}</div>
                ) : null}

                <div style={adminFormActionRowStyle}>
                  <button type="submit" disabled={creating} style={primaryButtonStyle}>
                    {creating ? "Adding..." : "Add New"}
                  </button>
                  <button type="button" onClick={resetAdminForm} style={secondaryButtonStyle}>
                    Clear Form
                  </button>
                </div>
              </form>
            </section>

            <div style={statsGridStyle}>
              <div style={statCardStyle}>
                <div style={statLabelStyle}>Total Participants</div>
                <div style={statValueStyle}>{summary.totalParticipants}</div>
              </div>
              <div style={statCardStyle}>
                <div style={statLabelStyle}>Total Shares</div>
                <div style={statValueStyle}>{summary.totalShares}</div>
              </div>
              <div style={statCardStyle}>
                <div style={statLabelStyle}>Total Expected Amount</div>
                <div style={statValueStyle}>{formatINR(summary.totalExpectedAmount)}</div>
              </div>
              <div style={statCardStyle}>
                <div style={statLabelStyle}>Full Groups</div>
                <div style={statValueStyle}>{fullyGroupedCows}</div>
              </div>
            </div>

            <section style={panelStyle}>
              <div style={tableHeaderStyle}>
                <div>
                  <div style={eyebrowStyle}>Submission Table</div>
                  <h2 style={sectionTitleStyle}>All registered users</h2>
                </div>
                <div style={actionRowStyle}>
                  <button type="button" onClick={downloadCsv} style={secondaryButtonStyle}>
                    Export Excel CSV
                  </button>
                  <button type="button" onClick={shareCsv} style={secondaryButtonStyle}>
                    Share CSV
                  </button>
                  <button type="button" onClick={shareSummaryOnWhatsApp} style={secondaryButtonStyle}>
                    WhatsApp Summary
                  </button>
                </div>
              </div>

              <div style={opsPanelStyle}>
                <div>
                  <div style={opsTitleStyle}>Arrange by 7-row groups</div>
                  <div style={opsCopyStyle}>
                    Drag any row into a different position. Every group below is separated into blocks of 7 rows so you
                    can organize one complete group at a time.
                  </div>
                </div>

                <div style={opsActionsGridStyle}>
                  <form onSubmit={swapSubmissionsByRowNumbers} style={swapFormStyle}>
                    <div style={swapLabelStyle}>Swap row</div>
                    <input
                      value={swapFrom}
                      onChange={(e) => setSwapFrom(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="From"
                      style={swapInputStyle}
                    />
                    <div style={swapArrowStyle}>↔</div>
                    <input
                      value={swapTo}
                      onChange={(e) => setSwapTo(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="To"
                      style={swapInputStyle}
                    />
                    <button type="submit" style={secondaryButtonStyle}>
                      Swap Rows
                    </button>
                  </form>

                  <form onSubmit={swapGroupsByNumbers} style={swapFormStyle}>
                    <div style={swapLabelStyle}>Swap group</div>
                    <input
                      value={groupSwapFrom}
                      onChange={(e) => setGroupSwapFrom(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="Group 1"
                      style={swapInputStyle}
                    />
                    <div style={swapArrowStyle}>↔</div>
                    <input
                      value={groupSwapTo}
                      onChange={(e) => setGroupSwapTo(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="Group 2"
                      style={swapInputStyle}
                    />
                    <button type="submit" style={secondaryButtonStyle}>
                      Swap Groups
                    </button>
                  </form>
                </div>
              </div>

              <div style={groupsStackStyle}>
                {groupedSubmissions.map((group, groupIndex) => {
                  const startRow = groupIndex * 7 + 1;
                  const endRow = startRow + group.length - 1;
                  const isCollapsed = collapsedGroups.includes(groupIndex);
                  const shareTotal = group.reduce((sum, item) => sum + item.shares, 0);
                  const shareStatus =
                    shareTotal === 7 ? "Full group" : shareTotal < 7 ? `${7 - shareTotal} share left` : `${shareTotal - 7} share over`;
                  const shareBadgeTone =
                    shareTotal === 7
                      ? cowGroupBadgeFullStyle
                      : shareTotal < 7
                        ? cowGroupBadgePendingStyle
                        : cowGroupBadgeOverStyle;

                  return (
                    <div key={`cow-group-${groupIndex}`} style={cowGroupStyle}>
                      <div style={cowGroupHeaderStyle}>
                        <div>
                          <div style={cowGroupTitleStyle}>Group {groupIndex + 1}</div>
                          <div style={cowGroupMetaStyle}>
                            Rows {startRow}-{endRow} • {group.length} participant{group.length > 1 ? "s" : ""}
                          </div>
                        </div>
                        <div style={groupHeaderActionsStyle}>
                          <div style={cowGroupBadgeStyle}>
                            Shares in group: {shareTotal}/7
                          </div>
                          <div style={{ ...cowGroupBadgeStyle, ...shareBadgeTone }}>
                            {shareStatus}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteGroup(group, groupIndex + 1)}
                            disabled={deletingId === `group-${groupIndex + 1}`}
                            style={dangerButtonStyle}
                          >
                            {deletingId === `group-${groupIndex + 1}` ? "Deleting..." : "Delete Group"}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleGroupCollapse(groupIndex)}
                            style={secondaryButtonStyle}
                          >
                            {isCollapsed ? "Maximize Group" : "Minimize Group"}
                          </button>
                        </div>
                      </div>

                      {isCollapsed ? (
                        <div style={collapsedGroupStyle}>
                          Group {groupIndex + 1} is minimized. Tap maximize to open rows {startRow}-{endRow}.
                        </div>
                      ) : (
                      <div style={tableWrapperStyle}>
                        <table style={tableStyle}>
                          <thead>
                            <tr>
                              <th style={thStyle}>Row</th>
                              <th style={thStyle}>Participant Name</th>
                              <th style={thStyle}>Father Name</th>
                              <th style={thStyle}>Niyyah Name</th>
                              <th style={thStyle}>Contact Number</th>
                              <th style={thStyle}>Address / Location</th>
                              <th style={thStyle}>Shares</th>
                              <th style={thStyle}>Total Amount</th>
                              <th style={thStyle}>Payment Status</th>
                              <th style={thStyle}>Meat Preference</th>
                              <th style={thStyle}>Timestamp</th>
                              <th style={thStyle}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.map((submission, indexInGroup) => {
                              const absoluteIndex = groupIndex * 7 + indexInGroup;
                              const rowNumber = absoluteIndex + 1;
                              const isDragged = draggedSubmissionId === submission.id;
                              const isEditing = editingId === submission.id;

                              return [
                                <tr
                                  key={submission.id}
                                  draggable={!isEditing}
                                  onDragStart={() => setDraggedSubmissionId(submission.id)}
                                  onDragOver={(event) => event.preventDefault()}
                                  onDrop={() => {
                                    const fromIndex = submissions.findIndex((item) => item.id === draggedSubmissionId);
                                    moveSubmission(fromIndex, absoluteIndex);
                                    setDraggedSubmissionId(null);
                                  }}
                                  onDragEnd={() => setDraggedSubmissionId(null)}
                                  style={isDragged ? draggedRowStyle : undefined}
                                >
                                  <td style={{ ...tdStyle, ...rowHandleStyle }}>
                                    <div style={rowNumberPillStyle}>{rowNumber}</div>
                                    <div style={dragHintStyle}>Drag</div>
                                  </td>
                                  <td style={tdStyle}>{submission.participantName}</td>
                                  <td style={tdStyle}>{submission.fatherName}</td>
                                  <td style={tdStyle}>{submission.niyyahName}</td>
                                  <td style={tdStyle}>{submission.contactNumber}</td>
                                  <td style={tdStyle}>{submission.addressLocation}</td>
                                  <td style={tdStyle}>{submission.shares}</td>
                                  <td style={tdStyle}>{formatINR(submission.totalAmount)}</td>
                                  <td style={tdStyle}>{submission.paymentStatus === "PAID" ? "Paid" : "Pending"}</td>
                                  <td style={tdStyle}>
                                    {submission.meatPreference === "DONATE" ? "Donate (Khairat)" : "Receive meat"}
                                  </td>
                                  <td style={tdStyle}>{new Date(submission.createdAt).toLocaleString()}</td>
                                  <td style={tdStyle}>
                                    <div style={rowActionsStyle}>
                                      <button type="button" onClick={() => startEdit(submission)} style={miniButtonStyle}>
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDelete(submission)}
                                        disabled={deletingId === submission.id}
                                        style={dangerButtonStyle}
                                      >
                                        {deletingId === submission.id ? "Deleting..." : "Delete"}
                                      </button>
                                    </div>
                                  </td>
                                </tr>,
                                isEditing ? (
                                  <tr key={`${submission.id}-editor`}>
                                    <td colSpan={12} style={editCellStyle}>
                                      <form onSubmit={handleEditSave} style={editFormGridStyle}>
                                          <label style={fieldBlockStyle}>
                                            <span style={fieldLabelStyle}>Participant</span>
                                            <input
                                              value={editForm.participantName}
                                              onChange={(e) =>
                                                setEditForm((current) => ({ ...current, participantName: e.target.value }))
                                              }
                                              style={inputStyle}
                                              minLength={2}
                                              maxLength={80}
                                              required
                                            />
                                          </label>
                                          <label style={fieldBlockStyle}>
                                            <span style={fieldLabelStyle}>Father Name</span>
                                            <input
                                              value={editForm.fatherName}
                                              onChange={(e) =>
                                                setEditForm((current) => ({ ...current, fatherName: e.target.value }))
                                              }
                                              style={inputStyle}
                                              minLength={2}
                                              maxLength={80}
                                              required
                                            />
                                          </label>
                                          <label style={fieldBlockStyle}>
                                            <span style={fieldLabelStyle}>Niyyah Name</span>
                                            <input
                                              value={editForm.niyyahName}
                                              onChange={(e) =>
                                                setEditForm((current) => ({ ...current, niyyahName: e.target.value }))
                                              }
                                              style={inputStyle}
                                              minLength={2}
                                              maxLength={80}
                                              required
                                            />
                                          </label>
                                          <label style={fieldBlockStyle}>
                                            <span style={fieldLabelStyle}>Contact Number</span>
                                            <input
                                              value={editForm.contactNumber}
                                              onChange={(e) =>
                                                setEditForm((current) => ({
                                                  ...current,
                                                  contactNumber: normalizeIndianPhoneNumber(e.target.value),
                                                }))
                                              }
                                              style={inputStyle}
                                              inputMode="tel"
                                              maxLength={13}
                                              required
                                            />
                                          </label>
                                          <label style={{ ...fieldBlockStyle, gridColumn: "1 / -1" }}>
                                            <span style={fieldLabelStyle}>Address / Location</span>
                                            <textarea
                                              value={editForm.addressLocation}
                                              onChange={(e) =>
                                                setEditForm((current) => ({ ...current, addressLocation: e.target.value }))
                                              }
                                              style={{ ...inputStyle, minHeight: 88, resize: "vertical" }}
                                              minLength={10}
                                              maxLength={240}
                                              required
                                            />
                                          </label>
                                          <label style={fieldBlockStyle}>
                                            <span style={fieldLabelStyle}>Payment Status</span>
                                            <select
                                              value={editForm.paymentStatus}
                                              onChange={(e) =>
                                                setEditForm((current) => ({
                                                  ...current,
                                                  paymentStatus: e.target.value as Submission["paymentStatus"],
                                                }))
                                              }
                                              style={inputStyle}
                                            >
                                              {qurbaniPaymentOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                  {option.label}
                                                </option>
                                              ))}
                                            </select>
                                          </label>
                                          <label style={fieldBlockStyle}>
                                            <span style={fieldLabelStyle}>Meat Preference</span>
                                            <select
                                              value={editForm.meatPreference}
                                              onChange={(e) =>
                                                setEditForm((current) => ({
                                                  ...current,
                                                  meatPreference: e.target.value as Submission["meatPreference"],
                                                }))
                                              }
                                              style={inputStyle}
                                            >
                                              {qurbaniMeatOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                  {option.label}
                                                </option>
                                              ))}
                                            </select>
                                          </label>
                                          <div style={fieldBlockStyle}>
                                            <span style={fieldLabelStyle}>Share Row</span>
                                            <div style={readonlyValueStyle}>1 share</div>
                                          </div>
                                          {editError ? (
                                            <div style={{ ...errorStyle, gridColumn: "1 / -1" }}>{editError}</div>
                                          ) : null}
                                          <div style={adminFormActionRowStyle}>
                                            <button type="submit" disabled={editSaving} style={primaryButtonStyle}>
                                              {editSaving ? "Saving..." : "Save Changes"}
                                            </button>
                                            <button type="button" onClick={cancelEdit} style={secondaryButtonStyle}>
                                              Cancel
                                            </button>
                                          </div>
                                      </form>
                                    </td>
                                  </tr>
                                ) : null,
                              ];
                            })}
                          </tbody>
                        </table>
                      </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "24px 16px 84px",
  background: "linear-gradient(180deg, #f5f7f4 0%, #eef2ef 100%)",
};

const shellStyle: React.CSSProperties = {
  maxWidth: 1280,
  margin: "0 auto",
  display: "grid",
  gap: 24,
};

const heroStyle: React.CSSProperties = {
  padding: "38px 0 6px",
};

const eyebrowStyle: React.CSSProperties = {
  display: "inline-flex",
  padding: "8px 14px",
  borderRadius: 999,
  background: "rgba(26,96,69,0.08)",
  color: "#1a6045",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

const titleStyle: React.CSSProperties = {
  margin: "18px 0 0",
  fontSize: "clamp(2.6rem, 6vw, 4.8rem)",
  lineHeight: 0.96,
  letterSpacing: "-0.05em",
  color: "#142a1f",
  fontFamily: "var(--font-playfair), Georgia, serif",
};

const subtitleStyle: React.CSSProperties = {
  margin: "18px 0 0",
  maxWidth: 820,
  fontSize: 18,
  lineHeight: 1.75,
  color: "#53665d",
};

const helperChipStyle: React.CSSProperties = {
  alignSelf: "start",
  borderRadius: 999,
  padding: "10px 14px",
  background: "rgba(26,96,69,0.08)",
  color: "#1a6045",
  fontWeight: 700,
  fontSize: 13,
};

const panelStyle: React.CSSProperties = {
  borderRadius: 34,
  padding: "28px 24px",
  background: "rgba(255,255,255,0.84)",
  border: "1px solid rgba(20,42,31,0.08)",
  boxShadow: "0 18px 50px rgba(20,40,30,0.06)",
};

const accessFormStyle: React.CSSProperties = {
  display: "flex",
  gap: 14,
  flexWrap: "wrap",
  alignItems: "end",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  color: "#173127",
  fontSize: 14,
  fontWeight: 800,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 18,
  border: "1px solid rgba(20,42,31,0.10)",
  background: "rgba(255,255,255,0.94)",
  fontSize: 16,
};

const adminFormGridStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
  marginTop: 22,
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
};

const fieldBlockStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const fieldLabelStyle: React.CSSProperties = {
  color: "#173127",
  fontSize: 14,
  fontWeight: 800,
};

const fieldHintStyle: React.CSSProperties = {
  color: "#6b7b74",
  fontSize: 12,
  lineHeight: 1.5,
};

const readonlyValueStyle: React.CSSProperties = {
  minHeight: 54,
  display: "flex",
  alignItems: "center",
  padding: "14px 16px",
  borderRadius: 18,
  background: "rgba(248,250,248,0.96)",
  border: "1px solid rgba(20,42,31,0.08)",
  color: "#173127",
  fontWeight: 700,
};

const adminTotalCardStyle: React.CSSProperties = {
  minHeight: 58,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 18px",
  borderRadius: 20,
  background: "linear-gradient(180deg, rgba(26,96,69,0.12), rgba(26,96,69,0.07))",
  color: "#174d37",
  fontSize: 24,
  fontWeight: 900,
};

const adminFormActionRowStyle: React.CSSProperties = {
  gridColumn: "1 / -1",
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
};

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  cursor: "pointer",
  background: "linear-gradient(180deg, #174d37, #123b2c)",
  color: "white",
  borderRadius: 999,
  padding: "14px 20px",
  fontWeight: 800,
  fontSize: 15,
};

const errorStyle: React.CSSProperties = {
  color: "#b42318",
  background: "rgba(244,67,54,0.08)",
  border: "1px solid rgba(244,67,54,0.16)",
  borderRadius: 16,
  padding: "12px 14px",
};

const successStyle: React.CSSProperties = {
  color: "#165534",
  background: "rgba(34,197,94,0.10)",
  border: "1px solid rgba(34,197,94,0.18)",
  borderRadius: 16,
  padding: "12px 14px",
};

const statsGridStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
};

const statCardStyle: React.CSSProperties = {
  borderRadius: 28,
  padding: "22px 20px",
  background: "rgba(255,255,255,0.84)",
  border: "1px solid rgba(20,42,31,0.08)",
  boxShadow: "0 18px 50px rgba(20,40,30,0.06)",
};

const statLabelStyle: React.CSSProperties = {
  color: "#6a7b74",
  fontSize: 12,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  fontWeight: 800,
};

const statValueStyle: React.CSSProperties = {
  marginTop: 10,
  color: "#174d37",
  fontSize: 30,
  fontWeight: 900,
};

const tableHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  alignItems: "end",
};

const actionRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const opsPanelStyle: React.CSSProperties = {
  marginTop: 22,
  padding: "18px 18px",
  borderRadius: 24,
  background: "rgba(26,96,69,0.06)",
  border: "1px solid rgba(26,96,69,0.08)",
  display: "grid",
  gap: 16,
};

const opsTitleStyle: React.CSSProperties = {
  color: "#173127",
  fontSize: 18,
  fontWeight: 800,
};

const opsCopyStyle: React.CSSProperties = {
  marginTop: 6,
  color: "#5b6c64",
  lineHeight: 1.65,
  fontSize: 14,
};

const swapFormStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  flexWrap: "wrap",
};

const opsActionsGridStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

const swapLabelStyle: React.CSSProperties = {
  color: "#173127",
  fontWeight: 800,
  fontSize: 14,
};

const swapInputStyle: React.CSSProperties = {
  width: 96,
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid rgba(20,42,31,0.10)",
  background: "rgba(255,255,255,0.94)",
  fontSize: 15,
};

const swapArrowStyle: React.CSSProperties = {
  color: "#1a6045",
  fontWeight: 800,
  fontSize: 18,
};

const sectionTitleStyle: React.CSSProperties = {
  marginTop: 12,
  fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
  lineHeight: 1.06,
  color: "#142a1f",
  fontFamily: "var(--font-playfair), Georgia, serif",
};

const tableWrapperStyle: React.CSSProperties = {
  overflowX: "auto",
  marginTop: 16,
};

const secondaryButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(20,42,31,0.08)",
  cursor: "pointer",
  background: "rgba(255,255,255,0.92)",
  color: "#163829",
  borderRadius: 999,
  padding: "12px 16px",
  fontWeight: 800,
  fontSize: 14,
};

const miniButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(20,42,31,0.10)",
  cursor: "pointer",
  background: "rgba(26,96,69,0.08)",
  color: "#174d37",
  borderRadius: 999,
  padding: "8px 12px",
  fontWeight: 800,
  fontSize: 13,
};

const dangerButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(177,58,44,0.14)",
  cursor: "pointer",
  background: "rgba(177,58,44,0.08)",
  color: "#a13727",
  borderRadius: 999,
  padding: "8px 12px",
  fontWeight: 800,
  fontSize: 13,
};

const rowActionsStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 1080,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 12px",
  color: "#173127",
  fontSize: 13,
  borderBottom: "1px solid rgba(20,42,31,0.10)",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 12px",
  color: "#5b6c64",
  fontSize: 14,
  borderBottom: "1px solid rgba(20,42,31,0.08)",
  verticalAlign: "top",
};

const editCellStyle: React.CSSProperties = {
  padding: "18px",
  background: "rgba(26,96,69,0.05)",
  borderBottom: "1px solid rgba(20,42,31,0.08)",
};

const editFormGridStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
};

const groupsStackStyle: React.CSSProperties = {
  display: "grid",
  gap: 18,
  marginTop: 22,
};

const cowGroupStyle: React.CSSProperties = {
  borderRadius: 26,
  padding: "18px 18px",
  background: "rgba(255,255,255,0.78)",
  border: "1px solid rgba(20,42,31,0.08)",
};

const cowGroupHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
};

const groupHeaderActionsStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
};

const collapsedGroupStyle: React.CSSProperties = {
  marginTop: 16,
  padding: "16px 18px",
  borderRadius: 18,
  background: "rgba(26,96,69,0.05)",
  border: "1px dashed rgba(26,96,69,0.14)",
  color: "#567067",
  fontSize: 14,
  lineHeight: 1.6,
};

const cowGroupTitleStyle: React.CSSProperties = {
  color: "#173127",
  fontSize: 20,
  fontWeight: 800,
};

const cowGroupMetaStyle: React.CSSProperties = {
  marginTop: 4,
  color: "#64756d",
  fontSize: 13,
};

const cowGroupBadgeStyle: React.CSSProperties = {
  borderRadius: 999,
  padding: "8px 12px",
  fontWeight: 800,
  fontSize: 13,
};

const cowGroupBadgeFullStyle: React.CSSProperties = {
  background: "rgba(26,96,69,0.10)",
  color: "#1a6045",
};

const cowGroupBadgePendingStyle: React.CSSProperties = {
  background: "rgba(190,149,49,0.12)",
  color: "#8b6720",
};

const cowGroupBadgeOverStyle: React.CSSProperties = {
  background: "rgba(193,70,54,0.10)",
  color: "#a13727",
};

const rowHandleStyle: React.CSSProperties = {
  whiteSpace: "nowrap",
};

const rowNumberPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 38,
  padding: "8px 10px",
  borderRadius: 999,
  background: "rgba(26,96,69,0.08)",
  color: "#1a6045",
  fontWeight: 800,
  fontSize: 13,
};

const dragHintStyle: React.CSSProperties = {
  marginTop: 6,
  color: "#7a8b84",
  fontSize: 12,
  fontWeight: 700,
};

const draggedRowStyle: React.CSSProperties = {
  opacity: 0.45,
  background: "rgba(26,96,69,0.06)",
};
