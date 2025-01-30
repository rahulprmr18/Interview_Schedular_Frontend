import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import "../styles/Scheduler.css";
import { Circles } from 'react-loader-spinner';

const localizer = momentLocalizer(moment);

const SchedulerPage = () => {
  const [events, setEvents] = useState([]);
  const [modalData, setModalData] = useState({ interviewee: "", interviewer: "", start: "", end: "" });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add", "update"
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    axios
      .get("http://localhost:5000/api/interviews", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      .then((response) => {
        setEvents(
          response.data.map((slot) => ({
            title: `${slot.interviewee} with ${slot.interviewer}`,
            start: new Date(slot.start),
            end: new Date(slot.end),
            id: slot._id,
          }))
        );
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setLoading(false);
      });
  }, [navigate, user]);

  const validateEvent = (newEvent) => {
    for (let event of events) {
      if (
        new Date(newEvent.start) < new Date(event.end) &&
        new Date(newEvent.end) > new Date(event.start) &&
        (!selectedEvent || selectedEvent.id !== event.id)
      ) {
        return false;
      }
    }
    return true;
  };

  const handleSelectSlot = (slotInfo) => {
    setModalData({
      interviewee: "",
      interviewer: "",
      start: slotInfo.start,
      end: slotInfo.end,
    });
    setModalMode("add");
    setShowModal(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setModalData({
      interviewee: event.title.split(" with ")[0],
      interviewer: event.title.split(" with ")[1],
      start: event.start,
      end: event.end,
    });
    setModalMode("update");
    setShowModal(true);
  };

  const handleSaveEvent = () => {
    if (!modalData.interviewee || !modalData.interviewer || !modalData.start || !modalData.end) {
      console.error("Please provide all the required fields.");
      return;
    }

    if (!validateEvent(modalData)) {
      console.error("Event conflicts with an existing event.");
      return;
    }

    setLoading(true);

    const apiCall =
      modalMode === "add"
        ? axios.post(
            "http://localhost:5000/api/interviews",
            {
              interviewee: modalData.interviewee,
              interviewer: modalData.interviewer,
              start: modalData.start,
              end: modalData.end,
            },
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          )
        : axios.put(
            `http://localhost:5000/api/interviews/${selectedEvent.id}`,
            {
              interviewee: modalData.interviewee,
              interviewer: modalData.interviewer,
              start: modalData.start,
              end: modalData.end,
            },
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );

    apiCall
      .then((response) => {
        const updatedEvent = {
          title: `${response.data.interviewee} with ${response.data.interviewer}`,
          start: new Date(response.data.start),
          end: new Date(response.data.end),
          id: response.data._id,
        };

        if (modalMode === "add") {
          setEvents((prevEvents) => [...prevEvents, updatedEvent]);
          toast.success("Event added successfully", { id: 'event-add-success' });
        } else {
          setEvents((prevEvents) =>
            prevEvents.map((event) => (event.id === selectedEvent.id ? updatedEvent : event))
          );
          toast.success("Event updated successfully", { id: 'event-update-success' });
        }

        setShowModal(false);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error saving event:", error);
        setLoading(false);
      });
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return; // Prevent deletion if no event is selected

    setLoading(true);
    axios
      .delete(`http://localhost:5000/api/interviews/${selectedEvent.id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      .then(() => {
        setEvents((prevEvents) => prevEvents.filter((event) => event.id !== selectedEvent.id));
        setShowModal(false);
        setLoading(false);
        toast.success("Event deleted successfully", { id: 'event-delete-success' });
      })
      .catch((error) => {
        console.error("Error deleting event:", error);
        setLoading(false);
      });
  };

  return (
    <div className="scheduler-page">
      <h1>Interview Scheduler</h1>
      <div className="calendar-container">
        {loading ? (
          <div className="loader">
            <Circles height="80" width="80" color="#4fa94d" />
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            selectable
            events={events}
            step={30}
            timeslots={1}
            defaultView="week"
            defaultDate={new Date()}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleEventClick}
            style={{ height: "80vh", width: "100%" }}
          />
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{modalMode === "add" ? "Add Event" : "Edit Event"}</h3>
            <form>
              <div>
                <label>Interviewee:</label>
                <input
                  type="text"
                  value={modalData.interviewee}
                  onChange={(e) => setModalData({ ...modalData, interviewee: e.target.value })}
                />
              </div>
              <div>
                <label>Interviewer:</label>
                <input
                  type="text"
                  value={modalData.interviewer}
                  onChange={(e) => setModalData({ ...modalData, interviewer: e.target.value })}
                />
              </div>
              <div>
                <label>Start Time:</label>
                <input
                  type="datetime-local"
                  value={moment(modalData.start).format("YYYY-MM-DDTHH:mm")}
                  onChange={(e) => setModalData({ ...modalData, start: new Date(e.target.value) })}
                />
              </div>
              <div>
                <label>End Time:</label>
                <input
                  type="datetime-local"
                  value={moment(modalData.end).format("YYYY-MM-DDTHH:mm")}
                  onChange={(e) => setModalData({ ...modalData, end: new Date(e.target.value) })}
                />
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={handleSaveEvent}>
                  {modalMode === "add" ? "Add" : "Save"}
                </button>
                {modalMode === "update" && (
                  <button type="button" onClick={handleDeleteEvent}>Delete</button>
                )}
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulerPage;