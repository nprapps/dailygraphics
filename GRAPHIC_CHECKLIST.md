# Daily Graphics Checklist

## Initial Concept

* Is the data organized by the component most important to the narrative?
  * geographic -> map
  * temporal -> timeline
  * ordinal -> table
* Do we have sufficient narrative context to understand the meaning of the data?
* If the data is vulnerable to being misinterpreted, have we adequately warned against it?

## Data

* Does the data mean we what think it means? (Are we very, very sure?)
* Is the data internally complete? (e.g., no missing years) If not, do we make it clear what data is missing?
  * For example, in a chart: dotted or missing lines and a corresponding footnote
  * In a table: “n/a” in the table cell, or an asterisk + footnote
* Have we been careful to ensure we don't treat "0" and "null" interchangably?
* Does any bucketing of the data effectively represent the distribution? (quartiles, quintiles, equal-interval, jenks breaks, box plot, etc.)

## Text

* Is the headline human-friendly? (conversational, non-technical)
* Is Every Word In The Headline Capitalized? (NPR headline style)
* Are quotes in the headline singular and escaped? (&amp;lsquo;)
* Does the Source line link back, if possible?
* Does the Credit line include everyone who worked on the graphic?
* Do the footnotes explain all caveats a normal reader would need to know to understand the chart fully?

## Technical / Code

* Does the graphic respond correctly? Does it read well on mobile? (e.g., nothing is cut off, text is readable, hover states disabled)
* Are we only including data we’re actually displaying (to keep page weight down)?
* Have you created a static fallback image for your final graphic? (fallback.png)
  * If there have been late edits to your graphic, have you updated the fallback image?
* Are all links out target="_blank" so they don't open inside the iframe.

## Charts

* Does the chart have a zero-baseline? (Or a very compelling reason for not having a zero-baseline?)
* Is there a grid line at the maximum value of the chart?
* Do the grid lines break at reasonable intervals?
* Are axes, labels, margins and colors consistent between charts that display related information? (small multiples, etc.)
* Are colors readable by someone who is red/green colorblind?
* Are the number of axis labels reasonable at various screen sizes?
* Does the entire chart fit within a normal user’s viewport?

## Tables

* Is the the sort order sensible?
* Is there a useful secondary sort order?
* Have any repetitive unit labels been moved to the header? (%, $)
* Are all numeric values within a column rounded to the same number of decimal places?

## Process / Project Management

* Has the graphic been edited by Alyson?
* Has the graphic gone through line edit and copy edit?
  * Line edit: Review/edit by a digital editor
  * Copy edit: Final edit by the copy desk. Most daily graphics are copy edited at the same time as their stories. But more complex graphics should go to copyedit before that, to give editors more time to review.
* Have you added the graphic to the Graphics Archive page in Confluence?
