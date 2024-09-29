from flask import Flask, send_from_directory, request, jsonify

from report_generator import generate_reports # Main function to generate reports based on user input
from report_generator import PDF_Type, DOCX_Type # Report formats
from report_generator import NormalReport, SpeakerRankingReport, SentimentReport, IntervalReport # Report types

app = Flask(__name__)

@app.route('/report',methods=['POST'])
def get_report():
    '''Expecting: {
        "meeting_data": {},
        "report_type": "normal"/"speaker_ranking"/"sentiment/"interval",
        "report_format": "pdf"/"docx"
    }'''
    receieved_data = request.json
    print("Recieved data",receieved_data)

    if not receieved_data:
        return jsonify({'error':'No data received'}), 400

    meeting_data = receieved_data['meeting_data']
    report_type = receieved_data['report_type']
    report_format = receieved_data['report_format']
    report_interval = receieved_data['interval']

    # Validate meeting_data
    if not meeting_data:
        return jsonify({'error':'Meeting data is empty'}), 400
    if "meetingTitle" not in meeting_data or "meetingStartTimeStamp" not in meeting_data or "meetingEndTimeStamp" not in meeting_data or "attendees" not in meeting_data or 'speakers' not in meeting_data or 'transcriptData' not in meeting_data or "speakerDuration" not in meeting_data:
        return jsonify({'error':'Invalid meeting data'}), 400

    if report_type == 'normal':
        report_type = NormalReport
    elif report_type == 'speaker_ranking':
        report_type = SpeakerRankingReport
    elif report_type == 'sentiment':
        report_type = SentimentReport
    elif report_type == 'interval':
        report_type = IntervalReport
    else:
        return jsonify({'error':'Invalid report type'}), 400

    if report_format == 'pdf':
        report_format = PDF_Type
    elif report_format == 'docx':
        report_format = DOCX_Type
    else:
        return jsonify({'error':'Invalid report format'}), 400

    # Generate
    if report_type == IntervalReport and not report_interval:
        return jsonify({'error':'Interval report needs interval'}), 400
    
    if report_type == IntervalReport:
        file_name = generate_reports(meeting_data, report_type, report_format, report_interval)
    else:
        file_name = generate_reports(meeting_data, report_type, report_format)
    file_name = file_name.split('/')[-1] # file_name is the path to the file(including ./reports/), we only need the file name
    return send_from_directory('./reports',file_name)

if __name__ == '__main__':
    app.run(port=8000,debug=True)