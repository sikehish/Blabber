from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet
from textblob import TextBlob
from docx import Document

# Function to analyze speech and generate sentiment report
def analyze_speech(transcript_data):
    analysis_results = []
    for entry in transcript_data:
        speaker = entry['name']
        content = entry['content']

        # Perform sentiment analysis
        blob = TextBlob(content)
        sentiment = blob.sentiment

        results = {
            'speaker': speaker,
            'polarity': sentiment.polarity,
            'subjectivity': sentiment.subjectivity,
            'content': content
        }
        analysis_results.append(results)
    
    return analysis_results

# Function to generate overall summary and key takeaways based on analysis
def generate_summary_and_takeaways(analysis_results):
    overall_summary = "In this meeting, the following key points were discussed:"
    key_takeaways = []

    if analysis_results:
        for entry in analysis_results:
            key_takeaways.append(f"{entry['speaker']} mentioned: '{entry['content']}' with sentiment polarity of {entry['polarity']:.2f}.")

    return overall_summary, key_takeaways

# Function to create the PDF report for normal report
def create_normal_report_pdf(meeting_data):
    analysis = analyze_speech(meeting_data['transcriptData'])
    overall_summary, key_takeaways = generate_summary_and_takeaways(analysis)

    file_name = f"./reports/{meeting_data['meetingTitle']}_normal_report.pdf"
    pdf = SimpleDocTemplate(file_name, pagesize=A4)
    elements = []
    
    styles = getSampleStyleSheet()
    title = f"<b>{meeting_data['meetingTitle']}</b>"
    elements.append(Paragraph(title, styles['Title']))
    elements.append(Spacer(1, 12))

    meeting_details = (
        f"Meeting Start Time: {meeting_data['meetingStartTimeStamp']}<br/>"
        f"Meeting End Time: {meeting_data['meetingEndTimeStamp']}<br/>"
        f"Attendees: {', '.join(meeting_data['attendees'])}<br/><br/>"
    )
    elements.append(Paragraph(meeting_details, styles['Normal']))
    
    elements.append(Paragraph("<b>Executive Summary:</b>", styles['Heading2']))
    elements.append(Paragraph(overall_summary, styles['Normal']))
    elements.append(Spacer(1, 12))

    elements.append(Paragraph("<b>Key Takeaways:</b>", styles['Heading2']))
    bullet_points = [ListItem(Paragraph(f"• {takeaway}", styles['Normal']), leftIndent=10) for takeaway in key_takeaways]
    elements.append(ListFlowable(bullet_points, bulletType='bullet'))
    elements.append(Spacer(1, 12))

    pdf.build(elements)
    print(f"{file_name} generated successfully.")
    return file_name

# Function to create the DOCX report for normal report
def create_normal_report_docx(meeting_data):
    analysis = analyze_speech(meeting_data['transcriptData'])
    overall_summary, key_takeaways = generate_summary_and_takeaways(analysis)

    file_name = f"./reports/{meeting_data['meetingTitle']}_normal_report.docx"
    doc = Document()

    doc.add_heading(meeting_data['meetingTitle'], 0)
    doc.add_paragraph(f"Meeting Start Time: {meeting_data['meetingStartTimeStamp']}")
    doc.add_paragraph(f"Meeting End Time: {meeting_data['meetingEndTimeStamp']}")
    doc.add_paragraph(f"Attendees: {', '.join(meeting_data['attendees'])}")

    doc.add_heading("Executive Summary:", level=1)
    doc.add_paragraph(overall_summary)

    doc.add_heading("Key Takeaways:", level=1)
    for takeaway in key_takeaways:
        doc.add_paragraph(f"- {takeaway}")

    doc.save(file_name)
    print(f"{file_name} generated successfully.")
    return file_name

# Function to rank speakers by duration
def rank_speakers(meeting_data):
    ranking = []
    for speaker in meeting_data['speakers']:
        duration = meeting_data['speakerDuration'].get(speaker, 0)
        ranking.append({
            'speaker': speaker,
            'duration': duration
        })
    
    ranking.sort(key=lambda x: x['duration'], reverse=True)
    return ranking

# Function to create the PDF report for speaker ranking
def create_speaker_ranking_report_pdf(meeting_data):
    ranking = rank_speakers(meeting_data)

    file_name = f"./reports/{meeting_data['meetingTitle']}_speaker_ranking_report.pdf"
    pdf = SimpleDocTemplate(file_name, pagesize=A4)
    elements = []
    
    styles = getSampleStyleSheet()
    title = "Speaker Ranking Report"
    elements.append(Paragraph(title, styles['Title']))
    elements.append(Spacer(1, 12))

    for index, entry in enumerate(ranking, start=1):
        elements.append(Paragraph(f"Rank {index}: {entry['speaker']} - Duration: {entry['duration']} seconds", styles['Normal']))
    
    pdf.build(elements)
    print(f"{file_name} generated successfully.")
    return file_name

# Function to create the DOCX report for speaker ranking
def create_speaker_ranking_report_docx(meeting_data):
    ranking = rank_speakers(meeting_data)

    file_name = f"./reports/{meeting_data['meetingTitle']}_speaker_ranking_report.docx"
    doc = Document()
    doc.add_heading("Speaker Ranking Report", 0)

    for index, entry in enumerate(ranking, start=1):
        doc.add_paragraph(f"Rank {index}: {entry['speaker']} - Duration: {entry['duration']} seconds")

    doc.save(file_name)
    print(f"{file_name} generated successfully.")
    return file_name

# Function to create the PDF report for sentiment analysis
def create_sentiment_report_pdf(meeting_data):
    analysis = analyze_speech(meeting_data['transcriptData'])

    file_name = f"./reports/{meeting_data['meetingTitle']}_sentiment_report.pdf"
    pdf = SimpleDocTemplate(file_name, pagesize=A4)
    elements = []
    
    styles = getSampleStyleSheet()
    title = "Sentiment Analysis Report"
    elements.append(Paragraph(title, styles['Title']))
    elements.append(Spacer(1, 12))

    for entry in analysis:
        elements.append(Paragraph(f"Speaker: {entry['speaker']}", styles['Normal']))
        elements.append(Paragraph(f"Polarity: {entry['polarity']:.2f}", styles['Normal']))
        elements.append(Paragraph(f"Subjectivity: {entry['subjectivity']:.2f}", styles['Normal']))
        elements.append(Paragraph(f"Content: {entry['content']}", styles['Normal']))
        elements.append(Spacer(1, 12))

    pdf.build(elements)
    print(f"{file_name} generated successfully.")
    return file_name

# Function to create the DOCX report for sentiment analysis
def create_sentiment_report_docx(meeting_data):
    analysis = analyze_speech(meeting_data['transcriptData'])

    file_name = f"./reports/{meeting_data['meetingTitle']}_sentiment_report.docx"
    doc = Document()
    doc.add_heading("Sentiment Analysis Report", 0)

    for entry in analysis:
        doc.add_paragraph(f"Speaker: {entry['speaker']}")
        doc.add_paragraph(f"Polarity: {entry['polarity']:.2f}")
        doc.add_paragraph(f"Subjectivity: {entry['subjectivity']:.2f}")
        doc.add_paragraph(f"Content: {entry['content']}")
        doc.add_paragraph()  # Add a blank line

    doc.save(file_name)
    print(f"{file_name} generated successfully.")
    return file_name

class NormalReport:
    def __init__(self):
        pass
    def __str__(self):
        return "Normal Report"

class SpeakerRankingReport:
    def __init__(self):
        pass
    def __str__(self):
        return "Speaker Ranking Report"

class SentimentReport:
    def __init__(self):
        pass
    def __str__(self):
        return "Sentiment Report"
    
class PDF_Type:
    def __init__(self):
        pass
    def __str__(self):
        return "PDF"

class DOCX_Type:
    def __init__(self):
        pass
    def __str__(self):
        return "DOCX"
    
def create_reports_directory():
    '''Creates a directory named './reports' if it does not exist.'''
    import os
    if not os.path.exists('./reports'):
        os.makedirs('./reports')
        print("Reports directory created successfully.")

# Main function to generate reports based on user input
def generate_reports(meeting_data,report_choice=NormalReport,format_choice=PDF_Type):
    '''Generates and saves a report based on user input.
        meeting_data: dict, contains meeting details and transcript data
        report_choice: the type of report to generate. Use the classes from this file: NormalReport, SpeakerRankingReport, SentimentReport
        format_choice: the format of the report. Use the classes from this file: PDF, DOCX'''
    
    # Create reports directory if it does not exist
    create_reports_directory()


    if report_choice ==  NormalReport:
        if format_choice ==  PDF_Type:
            return create_normal_report_pdf(meeting_data)
        elif format_choice ==  DOCX_Type:
            return create_normal_report_docx(meeting_data)
    elif report_choice ==  SpeakerRankingReport:
        print("generating speaker ranking report")
        if format_choice ==  PDF_Type:
            return create_speaker_ranking_report_pdf(meeting_data)
        elif format_choice ==  DOCX_Type:
            return create_speaker_ranking_report_docx(meeting_data)
    elif report_choice ==  SentimentReport:
        if format_choice ==  PDF_Type:
            return create_sentiment_report_pdf(meeting_data)
        elif format_choice ==  DOCX_Type:
            return create_sentiment_report_docx(meeting_data)
    else:
        raise ValueError("Invalid report or format choice.")

# Example usage
if __name__ == "__main__":
    # Sample meeting data object for testing
    meeting_data = {
        'meetingTitle': 'Team Sync',
        'meetingStartTimeStamp': '2024-09-28T10:00:00.000Z',
        'meetingEndTimeStamp': '2024-09-28T10:30:00.000Z',
        'attendees': ['Alice', 'Bob', 'Charlie'],
        'speakers': ['Alice', 'Bob'],
        'transcriptData': [
            {'name': 'Alice', 'content': 'Hello everyone! How are you?'},
            {'name': 'Bob', 'content': 'I am fine, thanks!'}
        ],
        'speakerDuration': {'Alice': 15, 'Bob': 10}
    }

    print("Returns",generate_reports(meeting_data, report_choice=SpeakerRankingReport, format_choice=DOCX_Type))
