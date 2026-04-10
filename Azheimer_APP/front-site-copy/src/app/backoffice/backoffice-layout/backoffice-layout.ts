import { Component, AfterViewInit, OnDestroy, Renderer2, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BackofficeHeader } from '../header/header';
import { BackofficeFooter } from '../footer/footer';
import { CommonModule } from '@angular/common';

declare var bootstrap: any;

@Component({
    selector: 'app-backoffice-layout',
    templateUrl: './backoffice-layout.html',
    styleUrls: ['./backoffice-layout.css'],
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        BackofficeHeader,
        BackofficeFooter
    ]
})
export class BackofficeLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
    private timer: any;

    constructor(
        private renderer: Renderer2,
        @Inject(DOCUMENT) private document: Document
    ) { }

    ngOnInit(): void {
        document.body.classList.add('backoffice-active');
        document.documentElement.classList.add('backoffice-body-theme');
        // Set template required attributes
        const html = this.document.documentElement;
        this.renderer.setAttribute(html, 'data-app-sidebar', 'full');
        this.renderer.setAttribute(html, 'data-bs-theme', 'light');
    }

    ngAfterViewInit(): void {
        this.initializeTemplate();
    }

    private initializeTemplate() {
        const win = window as any;

        // Increase timeout to ensure component DOM is fully rendered
        this.timer = setTimeout(() => {
            // Re-initialize NexLink specific scripts (now accessible as functions on window)
            if (win.initAppToggler) win.initAppToggler();
            if (win.initSidebarMenu) win.initSidebarMenu();
            if (win.Waves && win.Waves.init) win.Waves.init();
            if (win.initTooltips) win.initTooltips();
            if (win.currentYear) win.currentYear();
            if (win.setElementHeight) win.setElementHeight();

            // Re-initialize SimpleBar manually for Angular-rendered elements
            if (win.SimpleBar) {
                const simpleBarElements = document.querySelectorAll('[data-simplebar]');
                simpleBarElements.forEach(el => {
                    // Check if already initialized to avoid duplicates
                    if (!(el as any)._simplebar) {
                        new win.SimpleBar(el);
                    }
                });
            }

            // Re-initialize bootstrap elements manually for dynamic content
            if (typeof bootstrap !== 'undefined') {
                // Tooltips
                const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
                tooltipTriggerList.map((tooltipTriggerEl: any) => new bootstrap.Tooltip(tooltipTriggerEl));

                // Tabs - Explicitly initialize sidebar tabs to ensure they work
                const tabTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tab"]'));
                tabTriggerList.map((tabTriggerEl: any) => new bootstrap.Tab(tabTriggerEl));
            }

            // Force a resize event to trigger layout recalculations in main.js
            window.dispatchEvent(new Event('resize'));

            console.log('[NexLink] Backoffice template re-initialized after route change');
        }, 1200);
    }

    ngOnDestroy(): void {
        document.body.classList.remove('backoffice-active');
        document.documentElement.classList.remove('backoffice-body-theme');
        if (this.timer) clearTimeout(this.timer);
        // Optional: Reset attributes when leaving
        // const html = this.document.documentElement;
        // this.renderer.removeAttribute(html, 'data-app-sidebar');
    }
}
